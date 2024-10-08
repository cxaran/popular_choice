# app/__init__.py

from flask import Flask
from app.extensions import init_extensions
from app.config import config_by_name



def create_app(config_name='development'):
    app = Flask(__name__, static_folder='../static', static_url_path='/')
    app.config.from_object(config_by_name[config_name])

    init_extensions(app)
    
    from .control import control
    app.register_blueprint(control)

    from .tablero import tablero
    app.register_blueprint(tablero)

    from .preguntas import preguntas
    app.register_blueprint(preguntas)

    from .ronda import ronda
    app.register_blueprint(ronda)
    
    return app


