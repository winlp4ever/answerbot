# Transform question-vectorisation from postgresql to elastic search

import json
import time

from elasticsearch import Elasticsearch
import psycopg2
import psycopg2.extras
import uuid

es = Elasticsearch()

def main():
    # delete the old index in case it already exists
    es.indices.delete(index='qa', ignore=[400, 404])
    # and create a new one
    with open('./nlp/index.json') as index_file:
        source = index_file.read().strip()
        es.indices.create(index='qa', body=source)

    # connect to database
    f = open('db-credentials/config.json') # load config file
    dbconfig = json.load(f) # load credentials details
    conn = psycopg2.connect("dbname=%s user=%s host=%s port=%d password=%s"
        % (dbconfig['database'], dbconfig['user'], dbconfig['host'], dbconfig['port'], dbconfig['password']))
    cur = conn.cursor(cursor_factory=psycopg2.extras.DictCursor) # use psycopg2.extras.DictCursor to return row as dict object

    # retrieve all questions
    cur.execute('''
        SELECT question.*
        from question 
        inner join (
            SELECT distinct question_id
            from question_answer_temp 
            inner join answer_temp
            on answer_temp.id = question_answer_temp.answer_temp_id 
            inner join question 
            on question_answer_temp.question_id = question.id
            
            where answer_temp.answer_valid = '1' and answer_teacher_manual_review = true
        ) as qs 
        on question.id = qs.question_id
        inner join (
            select id
            from question
            where question_equivalent = 0
            and question_fuzzy = 0
            and question_valid = 1
            and question_teacher_manual_review = true
        ) as cs
        on (question.question_equivalent = cs.id or question.id = cs.id) 
        where question.question_text like '%inline block%'
    ''')
    q = cur.fetchone()
    cnt = 0
    while q:
        doc = {
            'id': q['id'],
            'text': q['question_text'],
            'vectorisation': q['vectorisation'],
            'rep': q['question_tsv'],
        }
        es.index(index='qa', body=doc, id=q['id'])
        cnt += 1
        print('done for %d - processed: %d' % (q['id'], cnt))
        q = cur.fetchone()
    # close the database
    cur.close()
    conn.close()


def verify():
    doc = {
        'size' : 10000,
        'query': {
            'match_all' : {}
        }
    }
    res = es.search(index='qa', body=doc)
    print(res['hits']['total'])
    #print(es.get(index='qa', doc_type='questions', id=2301))


if __name__ == '__main__':
    main()
    time.sleep(1) # elastic search refreshes every 1s, u need to sleep a bit to be able to see new index docs
    verify()