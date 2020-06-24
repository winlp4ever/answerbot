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
        select refqs.id as refid, refqs.question_fuzzy as isfuzzy, coalesce(qas.nb_related, 0) as nb_related, allqs.*
        from 
            question as allqs
        inner join 
            question as refqs 
        on (allqs.id = refqs.id and (allqs.question_equivalent = 0 or refqs.question_equivalent = 4584))
        or allqs.question_equivalent = refqs.id
        full outer join (
            select id_origin, count(id_target) as nb_related
            from question_relations
            group by id_origin
        ) as qas
        on refqs.id = qas.id_origin

        where (refqs.question_fuzzy = 0 or (refqs.question_fuzzy=1 and nb_related > 0))
        and refqs.question_valid = 1
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