from flask import Flask, render_template, jsonify, request

from flask_socketio import SocketIO, send, emit

from flask_sqlalchemy import SQLAlchemy

from responder import Responder

import requests
import json

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = ""
db = SQLAlchemy(app)
res = Responder()

@app.route('/ask-bob', methods=['POST'])
def respond():
    if request.headers['Content-Type'] == 'application/json':
        return jsonify(res.detectIntent(request.json, db))


if __name__ == '__main__':
    app.run(port=6800, threaded=True)