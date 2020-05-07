import psycopg2
import json

f = open('db-credentials/config.json')

dbconfig = json.load(f)

conn = psycopg2.connect("dbname=%s user=%s host=%s port=%d password=%s"
    % (dbconfig['database'], dbconfig['user'], dbconfig['host'], dbconfig['port'], dbconfig['password']))

cur = conn.cursor()
cur.execute("SELECT id, question_text FROM question;")
questions = cur.fetchall()
print(questions)

conn.commit()

# close the database
cur.close()
conn.close()
