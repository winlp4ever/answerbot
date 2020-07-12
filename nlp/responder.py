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

def now():
    tm = datetime.fromtimestamp(time.time())
    return '{}/{}/{} {}:{}:{}'.format(tm.day, tm.month, tm.year, tm.hour, tm.minute, tm.second)

class Responder:
    def __init__(self):
        self.sim = SimiSearch()

    def detectIntent(self, msg, db):
        q = msg['chat']['text']
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
                'conversationID': msg['conversationID']
            }
        if data['name'] == 'exercise_ask':
            return self.getQuestionAid(msg, db)
        if data["name"] in ('greet', 'ask_name', 'bot_challenge', 'being_impolite', 'how_are_you'):
            return { 
                'chat': 
                {
                    'text': messages[data['name']]["phrases"],
                    'type': 'chat',
                    'user': bob
                },
                'conversationID': msg['conversationID']
            }
        return self.getAnswer(msg, db)
    
    def getQuestionAid(self, msg, db):
        question = msg['chat']['text']
        reply = template.copy()
        reply['original_question'] = question
        reply['datetime'] = now()
        res = db.session.execute('''
            select * from activities 
            where activitytype = 'submit' 
            and status = false 
            and exerciseid = %d
            and studentid = %d
            order by id desc, date desc
        ''' % (msg['chat']['user']['exerciseid'], msg['conversationID'])).fetchone()
        if res:
            res = dict(res)
            reply['answer'] = res['record']
            reply['text'] = res['record']['message']
            reply['type'] = 'exercise-err-message'
            reply['original_question'] = question
            return {
                'chat': reply,
                'conversationID': msg['conversationID']
            }
        return self.getCommonError(msg, db)
            
        
    def getCommonError(self, msg, db):
        question = msg['chat']['text']
        reply = template.copy()
        reply['original_question'] = question
        
        reply['datetime'] = now()
        res = db.session.execute('''
            select error_code_message, error_code_count
            from error_codes
            where id_exercise = %d
            order by error_code_count desc
        ''' % msg['chat']['user']['exerciseid']).fetchall()[:4]
        reply['answer'] = [dict(r) for r in res] if res else []
        reply['type'] = 'exercise-common-errs'
        reply['original_question'] = question
        return {
            'chat': reply,
            'conversationID': msg['conversationID']
        }

    def getAnswer(self, msg, db):
        question = msg['chat']['text']
        qs = self.sim.findSimQuestions(question, 5)
        print(qs)

        reply = template.copy()
        reply['original_question'] = question
        tm = datetime.fromtimestamp(time.time())
        reply['datetime'] = '{}/{}/{} {}:{}:{}'.format(tm.day, tm.month, tm.year, tm.hour, tm.minute, tm.second)
        sol_id = -1

        if qs and qs[0]['score'] > 1.8:
            ans = db.session.execute('select * from get_answer(%s)' % str(qs[0]['id'])).fetchone()
            if ans:
                ans = dict(ans)
                res = ans.copy()        
                reply['answer'] = res
                print(res)
                reply['text'] = res['answer_paragraph'][:90]
                sol_id = res['qid']
                if len(res['answer_paragraph']) > 90 and not reply['text'].endswith('..'):
                    reply['text'] += '...'
            
            # close the database
        
        print('responded.')
        reply['related_questions'] = self.getRelatedQuestions(sol_id, db)
        reply['type'] = 'answer'
        return {
            'chat': reply,
            'conversationID': msg['conversationID']
        }
    def getRelatedQuestions(self, id, db):
        res = db.session.execute(''' 
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
        ''' % str(id)).fetchall()     
        res = [dict(r) for r in res] if res else []
        return res
