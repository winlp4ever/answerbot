# on another CPU machine
from bert_serving.client import BertClient
from collections import deque

import json

from time import sleep


import socketio
import sys

from scipy.spatial.distance import cosine


import spacy
nlp = spacy.load('en')

def run():
    if not sys.argv[1]:
        sys.stderr('You must enter an ip for your remote machine!')
        return
    bc = BertClient(ip=sys.argv[1])  # ip address of the GPU machine
    QAs = json.load(open('nlp/qas.json'))
    sio = socketio.Client()

    questions = [q for q in QAs]
    print('begin embedding all questions...')
    embeds = bc.encode(questions)
    print('finished!')

    MEMO_MAX_LEN = 10
    Q = deque(maxlen=MEMO_MAX_LEN)
    def send_msg(event, msg):
        sio.emit('is typing', {'sender': msg['sender'], 'dest': msg['dest']})
        sleep(1)
        sio.emit(event, msg)

    @sio.event
    def connect():
        print('connection established')

    
    @sio.on('ask for hints')
    def on_message(typed):
        msg = typed['msg']
        
        
        #try:
        print('added new question')
        nonlocal Q
        Q.append(typed)
        return


    @sio.on('new chat')
    def on_message(msg):
        if msg['dest'] != 'bot':
            return
        if 'referral' in msg:
            
            if len(msg['msg']) > 150:
                send_msg('new chat', {'sender': 'bot', 'dest': msg['referral'], 
                    'msg': msg['msg'][:150] + '...',
                    'fullanswer': "Prof's reply: %s" %msg['msg'],
                    'type': 'answer'})
                return
            send_msg('new chat', {'sender': 'bot', 'dest': msg['referral'], 'msg': "Prof's reply:%s" %msg['msg'], 'type': 'answer'})
            return

        q = msg['msg']
        emb = bc.encode([q])[0]
        u = max(range(len(questions)), key=lambda j: 1.0-cosine(embeds[j], emb))
        if cosine(embeds[u], emb) < 0.06:
            match = QAs[questions[u]]
            answer = match['answer']
            for sent in nlp(answer).sents:
                send_msg('new chat', {'sender': 'bot', 'dest': msg['sender'], 'msg': sent.text, 'type': 'answer'})

            if 'courses' in match or 'toread' in match:
                res = {'sender': 'bot', 'dest': msg['sender'], 'msg': 'more insights?'}
                if 'courses' in match:
                    res['courses'] = match['courses']
                if 'toread' in match:
                    res['toread'] = match['toread']
                send_msg('new chat', res)
        elif q.endswith('?'):
            excuses = ["I'm not qualified to answer this!",
                "I'll deliver this question to someone capable!"]
            for s in excuses:
                send_msg('new chat', {'sender': 'bot', 'dest': msg['sender'], 'msg': s})
            send_msg('new chat', {'sender': 'bot', 'dest': 'Prof. Alpha', 'msg': 'A student (%s) has the following question: %s' %(msg['sender'], msg['msg']), 'referral': msg['sender']})

    @sio.event
    def disconnect():
        print('disconnected from server')

    sio.connect('http://localhost:5000')
    while True:
        sleep(0.05)
        if Q:
            print('Q not empty! question answering...') 
            msg = Q.popleft() 
            if len(msg['msg']) < 10:
                sio.emit('hints', {'dest': msg['sender'], 'hints': []})
            else:
                emb = bc.encode([msg['msg']])[0]
                hints = []
                for i, q in enumerate(QAs):
                    confid = 1.0-cosine(embeds[i], emb)
                    if confid > 0.5:
                        hints.append({'hint': q, 'confidence': '%.2f'%confid})
                hints.sort(key= lambda u: u['confidence'], reverse=True)
                if len(hints) > 5:
                    hints = hints[:5]
                sio.emit('hints', {'dest': msg['sender'], 'hints': hints})
                print('hints sent!')


    sio.wait()
    

if __name__ == "__main__":
    run()