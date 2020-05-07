import json
from time import sleep
import socketio

def run():
    sio = socketio.Client()

    @sio.event
    def connect():
        print('connection established')

    @sio.on('ask-bob')
    def on_message(msg):
        print(msg['chat'])
        if msg['chat']['text'] == 'what on earth?':
            sio.emit('bob-msg', {
                'chat': {
                'user': {
                    'username': 'bob',
                    'email': '',
                    'color': '',
                    'userid': 0
                },
                'type': 'chat',
                'text': 'i found something for you',
            },
            'conversationID': msg['conversationID']
            })
            res = '... Terrestrial animals, humans are characterized by their erect posture and bipedal locomotion; high manual dexterity and heavy tool use compared to other animals...'
            link = 'https://en.wikipedia.org/wiki/Human'
            sio.emit('bob-msg', {
                'chat': {
                'user': {
                    'username': 'bob',
                    'email': '',
                    'color': '',
                    'userid': 0
                },
                'type': 'answer',
                'text': res,
                'orinQuestion': msg['chat']['text'],
                'url': link,
                
            },
                'conversationID': msg['conversationID']
            })
            sio.emit('bob-msg', {
                'chat': {
                'user': {
                    'username': 'bob',
                    'email': '',
                    'color': '',
                    'userid': 0
                },
                'type': 'multiple-choices',
                'text': 'is this helpful?',
                'choices': [
                    {
                        'text': 'yeah, I think so &#128077;'
                    }, 
                    {
                        'text': 'no, not really &#128078;'
                    }
                ]
            },
            'conversationID': msg['conversationID']
            })
        res = input('Bob\'s response:\n')
        sio.emit('bob-msg', {
            'chat': {
                'user': {
                    'username': 'bob',
                    'email': '',
                    'color': '',
                    'userid': 0
                },
                'type': 'chat',
                'text': res
            },
            'conversationID': msg['conversationID']
        })
    
    @sio.event
    def disconnect():
        print('disconnected from server')

    sio.connect('http://localhost:5000')
    sio.wait()


if __name__ == "__main__":
    run()


