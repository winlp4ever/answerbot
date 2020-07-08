import json
from time import sleep
import socketio
from collections import deque
from similarity_search import SimiSearch 
import psycopg2
import psycopg2.extras
from psycopg2 import pool

import random

import json
import time 
from datetime import datetime
import requests

import asyncio
import requests

from functools import lru_cache

bob = {
    'username': 'bob',
    'email': '',
    'userid': -1
}
template = {
    'user': bob,
    'type': 'chat',
    'text': '',
}

messages = {
    "greet": {
        "phrases": "Bonjour"
    },
    "ask_name": {
        "phrases": "Je m'appelle Bob, votre assistant professeur"
    },
    "bot_challenge": {
        "phrases": "Je suis un bot, évidemment"
    },
    "being_impolite": {
        "phrases": "Hmm ... -_0 *_*"
    },
    "how_are_you": {
        "phrases": "Je vais bien, merci."
    }
}


class Responder:
    def __init__(self, mx_conns=2000, config_fp='db-credentials/config.json'):
        # load db credentials
        f = open(config_fp)
        dbconfig = json.load(f)
        f.close()
        self.sim = SimiSearch()
        self.pg = psycopg2.pool.SimpleConnectionPool(0, mx_conns, host=dbconfig['host'], database=dbconfig['database'],
            user=dbconfig['user'], password=dbconfig['password'], port=dbconfig['port'],
            connect_timeout=2)
        if self.pg:
            print("Connection pool created successfully")

        self.conn  = self.pg.getconn()

        if self.conn:
            print("successfully received connection from connection pool ")

    def close(self):
        if self.pg:
            self.pg.closeall
        print("PostgreSQL connection pool is closed")

    def detectIntent(self, old_msg):
        q = old_msg['chat']['text']
        url = 'http://localhost:5005/model/parse'
        obj = {
            "text": q
        }
        data = requests.post(url,json=obj).json()["intent"]
        if data["confidence"] < 0.7:
            return {
                'chat':
                {
                    'text': "Merci de re-poser la question/chat d'une manière plus précise",
                    'type': 'chat',
                    'user': bob
                },
                'conversationID': old_msg['conversationID']
            }
        if data['name'] == 'exercise_ask':
            return self.getQuestionAid(old_msg)
        if data["name"] in ('greet', 'ask_name', 'bot_challenge', 'being_impolite', 'how_are_you'):
            return { 
                'chat': 
                {
                    'text': messages[data['name']]["phrases"],
                    'type': 'chat',
                    'user': bob
                },
                'conversationID': old_msg['conversationID']
            }
        return self.getAnswer(old_msg)
    
    def getQuestionAid(self, old_msg):
        question = old_msg['chat']['text']
        cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        msg = template.copy()
        msg['original_question'] = question
        tm = datetime.fromtimestamp(time.time())
        msg['datetime'] = '{}/{}/{} {}:{}:{}'.format(tm.day, tm.month, tm.year, tm.hour, tm.minute, tm.second)
        cur.execute('''
            select * from activities 
            where activitytype = 'submit' 
            and status = false 
            and exerciseid = %d
            and studentid = %d
            order by id desc, date desc
        ''' % (old_msg['chat']['user']['exerciseid'], old_msg['conversationID']))
        res = cur.fetchone()
        if res:
            msg['answer'] = res['record']
            msg['text'] = res['record']['message']
            msg['type'] = 'exercise-err-message'
            msg['original_question'] = question
        else:
            cur.execute('''
                select error_code_message, error_code_count
                from error_codes
                where id_exercise = %d
                order by error_code_count desc
            ''' % old_msg['chat']['user']['exerciseid'])
            res = cur.fetchall()
            msg['answer'] = res[:4] if res else []
            msg['type'] = 'exercise-common-errs'
            msg['original_question'] = question
        cur.close()
        return {
            'chat': msg,
            'conversationID': old_msg['conversationID']
        }

    def getAnswer(self, old_msg):
        question = old_msg['chat']['text']
        qs = self.sim.findSimQuestions(question, 5)
        print(qs)

        msg = template.copy()
        msg['original_question'] = question
        tm = datetime.fromtimestamp(time.time())
        msg['datetime'] = '{}/{}/{} {}:{}:{}'.format(tm.day, tm.month, tm.year, tm.hour, tm.minute, tm.second)
        sol_id = -1

        if qs and qs[0]['score'] > 1.8:
            print(qs[0]['id'])
            cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
            cur.execute('''
                select answer_temp.*, q.*
                from 
                    question_answer_temp
                inner join
                    (
                        select qs.id as qid, question.question_fuzzy as fuzzy
                        from 
                            question 
                        inner join
                            question as qs
                        on (
                                question.id = qs.question_equivalent 
                                or question.id = qs.id 
                                or question.question_equivalent = qs.id
                                or (
                                        question.question_equivalent = qs.question_equivalent 
                                        and question.question_equivalent > 0
                                    )
                            ) 
                        where question.id = %s
                    ) as q
                on (q.qid = question_answer_temp.question_id)
                inner join 
                    answer_temp
                on question_answer_temp.answer_temp_id = answer_temp.id
                where answer_temp.answer_valid = '1' 
                and answer_temp.answer_teacher_manual_review = true
                order by answer_rank, answer_temp.id asc;
            ''', [str(qs[0]['id'])])
            ans = cur.fetchone()
            if ans:
                res = ans.copy()        
                while ans:
                    if ans['answer_level'] == old_msg['chat']['user']['level']:
                        res = ans
                        break
                    ans = cur.fetchone()
                msg['answer'] = res
                print(res)
                msg['text'] = res['answer_paragraph'][:90]
                sol_id = res['qid']
                if len(res['answer_paragraph']) > 90 and not msg['text'].endswith('..'):
                    msg['text'] += '...'
            
            # close the database
            cur.close()                
        
        print('responded.')
        msg['related_questions'] = self.getRelatedQuestions(sol_id)
        #msg['related_questions'] = []
        msg['type'] = 'answer'
        return {
            'chat': msg,
            'conversationID': old_msg['conversationID']
        }
    def getRelatedQuestions(self, id):
        cur = self.conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        cur.execute(''' 
            select question_relations.id_target as trg, question.question_text
            from 
                (
                    select distinct question_id 
                    from 
                        question_answer_temp
                ) as qs
            inner join 
                question_relations
            on question_relations.id_target = qs.question_id 
            inner join 
                question 
            on qs.question_id = question.id
            where question_relations.id_origin=%s
            and question_fuzzy = 0
            and question_valid = 1
        ''', [str(id)])
        res = cur.fetchall()
        cur.close()
        return res
