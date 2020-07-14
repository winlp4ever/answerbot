from sqlalchemy import create_engine

db_string = "postgres://bob3wa:@theai_bob3wa_2020@test-db.czcdgzwouwz1.eu-west-3.rds.amazonaws.com:5433/dbbob3wa"
db = create_engine(db_string)

result_set = db.execute('select * from question join question_answer_temp on question.id = question_answer_temp.question_id where id = 5601')

for r in result_set:  
    print(r)