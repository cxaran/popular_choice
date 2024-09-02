
from flask_socketio import SocketIO
from flask_cors import CORS
from pymongo import MongoClient
import json
import os

from app.sockets import socketio_events

socketio = SocketIO()
cors = CORS()
mongo_client = None
db = None

def init_extensions(app):
    global mongo_client
    mongo_uri = app.config.get('MONGO_URI')
    mongo_db_name = app.config.get('MONGO_DB')
    
    if mongo_uri and mongo_db_name:
        mongo_client = MongoClient(mongo_uri)
        db = mongo_client[mongo_db_name]
        app.mongo_db = db

    socketio.init_app(app, cors_allowed_origins=app.config.get('CORS_ALLOWED_ORIGINS', '*'))
    socketio_events(socketio)
    
    
    cors.init_app(app, resources={r"/*": {"origins": app.config.get('CORS_ALLOWED_ORIGINS', '*')}})

    file_path = os.path.join(app.root_path, '../preguntas.json')
    with open(file_path, 'r', encoding='utf-8') as file:
        app.preguntas = json.load(file)

