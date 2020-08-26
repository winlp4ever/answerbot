import psycopg2
import json
from elasticsearch import Elasticsearch

from sentence_transformers import SentenceTransformer
mod = SentenceTransformer('distiluse-base-multilingual-cased')
es = Elasticsearch()


# read db-config file
f = open('db-credentials/config.json')

dbconfig = json.load(f)
# connect to the server
conn = psycopg2.connect("dbname=%s user=%s host=%s port=%d password=%s"
    % (dbconfig['database'], dbconfig['user'], dbconfig['host'], dbconfig['port'], dbconfig['password']))

cur = conn.cursor()

qa_links = [
    ['what is logistic regression', 'https://d18ky98rnyall9.cloudfront.net/06.1-LogisticRegression-Classification.b2fadb80b22b11e49f072fa475844d6b/full/540p/index.webm?Expires=1598572800&Signature=OLVKvUmXFsvG9jTBxIYarvGbVSOX2cim0lRnyTYOIlT4dkJ~mCf4MquhWMRQuYm1KCgVW-49pk8C4zk0bt7Vb4CZZvNx~7H-J97ydlC7ZIrVdx~fDf1d7lm9zNPYz7FE5Ts4uA5QWueZUvHer16toml8pzcyzYe~EojOlk8I6-k_&Key-Pair-Id=APKAJLTNE6QMUY6HBC5A', 430]
]
for q, link, sttime in qa_links:
    embeddings = mod.encode([q])[0].tolist()
    cur.execute('''
        insert into question 
        (
            question_text, 
            question_teacher_manual_review, 
            question_valid, 
            question_fuzzy,
            question_equivalent, 
            question_tsv, 
            question_normalized, 
            dimensions, 
            vectorisation, 
            question_condition_id
        )
        values (
            %s,
            true,
            1,
            0,
            0,
            to_tsvector(%s),
            %s,
            512,
            %s,
            6
        )
        returning id, question_text, vectorisation, question_tsv
    ''', [q, q, q, embeddings])
    qidx, qtext, qv, qts = cur.fetchone()
    cur.execute('''
        insert into answer_temp (
            answer_text,
            answer_teacher_manual_review,
            answer_rank,
            answer_valid,
            source,
            source_type,
            meta
        )
        values (
            'answer video',
            true,
            -1,
            '1',
            %s,
            'video',
            %s
        ) returning id
    ''', [link, json.dumps({
        "start_time": sttime
    })])
    aidx = cur.fetchone()[0]
    print(qidx, aidx)
    cur.execute('''
        insert into question_answer_temp (
            question_id,
            answer_temp_id
        ) values (
            %s,
            %s
        )
    ''', [qidx, aidx])
    doc = {
        'id': qidx,
        'text': qtext,
        'vectorisation': qv,
        'rep': qts,
    }
    es.index(index='qacoursera', body=doc, id=qidx)

conn.commit()

# close the database
cur.close()
conn.close()