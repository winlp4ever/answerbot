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

from functools import lru_cache

from responder import Responder 

sio = socketio.AsyncClient(ssl_verify=False)


# load db credentials
f = open('db-credentials/config.json')
dbconfig = json.load(f)
f.close()

conversations = {}

async def run():
    rep = Responder()
    try:
        # load azure credentials
        f = open('azure-credentials/config.json')
        azureConfig = json.load(f)
        f.close()

        @sio.event
        def connect():
            print('connection established')

        @sio.on('ask-bob')
        async def on_message(msg):
            await sio.emit('bob-msg', rep.detectIntent(msg))

        @sio.event
        def disconnect():
            print('disconnected from server')


        await sio.connect('https://localhost:5000')
        await sio.wait()
    except (Exception, psycopg2.DatabaseError) as error :
        print (error)

    finally:
        rep.close()


#asyncio.run(run())
loop = asyncio.get_event_loop()
loop.run_until_complete(run())
