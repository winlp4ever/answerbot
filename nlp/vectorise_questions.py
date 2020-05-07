'''
This script use bert-as-a-service, extracts all existing questions from a 
postgresql then calculate and store back to db all bert vectorisations of questions.
The goal is to have a system that returns similar questions to the one typed by 
front user.
'''
import psycopg2
import json
from tokenizer import Token

tk = Token()
from sentence_transformers import SentenceTransformer
mod = SentenceTransformer('bert-base-nli-mean-tokens')


# read db-config file
f = open('db-credentials/config.json')

dbconfig = json.load(f)
# connect to the server
conn = psycopg2.connect("dbname=%s user=%s host=%s port=%d password=%s"
    % (dbconfig['database'], dbconfig['user'], dbconfig['host'], dbconfig['port'], dbconfig['password']))

cur = conn.cursor()

# extract all questions from the table 'question'
cur.execute("SELECT id, question_text FROM question;")
questions = cur.fetchall()

# iterate over all questions
for idx, text in questions:
    tks = tk.tokenize([text])[0]
    embeddings = mod.encode([tks])[0]
    cur.execute("update question set dimensions=768, vectorisation=%s where id=%s", [embeddings.tolist(), idx])
    print('done for %d' % idx)

conn.commit()

# close the database
cur.close()
conn.close()