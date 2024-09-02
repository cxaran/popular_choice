# app/sockets.py

from flask_socketio import emit, join_room
from flask import request
import random
import string

# Diccionario para almacenar los tableros y sus clientes conectados
tableros = {}

def socketio_events(socketio):
    
    @socketio.on('connect')
    def handle_connect():
        print('Cliente conectado')
    
    @socketio.on('disconnect')
    def handle_disconnect():
        for code, clients in tableros.items():
            if request.sid in clients:
                clients.remove(request.sid)
                print(f'Cliente ${code} desconectado')
                break
    
    @socketio.on('generateGameCode')
    def handle_generate_game_code():
        code = ''.join(random.choices(string.ascii_uppercase + string.digits, k=6))
        join_room(code)
        if code not in tableros:
            tableros[code] = []
        tableros[code].append(request.sid)
        emit('gameCodeGenerated', {'code': code})
        print(f'Código de juego generado: {code}')
    
    @socketio.on('joinGame')
    def handle_join_board(data):
        code = data.get('code')
        if code:
            join_room(code)
            if code not in tableros:
                tableros[code] = []
            tableros[code].append(request.sid)
            emit('board_joined', {"message": f"Tablero {code} unido"}, room=code)
            print(f"Tablero {code} unido con SID: {request.sid}")
        else:
            emit('error', {"message": "Código no proporcionado"})

