import json
import time

from elasticsearch import Elasticsearch
import psycopg2
import psycopg2.extras
import uuid



es = Elasticsearch()


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
cur.execute("SELECT * FROM question;")
q = cur.fetchone()
while q:
    time.sleep(0.1)
    doc = {
        'id': q['id'],
        'text': q['question_text'],
        'vectorisation': q['vectorisation']
    }
    print(q['question_text'])
    es.index(index='qa', body=doc, id=q['id'])
    print('done for %d' % q['id'])
    q = cur.fetchone()
# close the database
cur.close()
conn.close()
