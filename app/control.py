from flask import Blueprint, request, jsonify, current_app
from app.sockets import tableros
from app.extensions import socketio

control = Blueprint('control', __name__)

def buscar_partida_por_codigo(code):
    return current_app.mongo_db.partida.find_one({"codigo": code})

def validar_codigo(code):
    if not code or len(code) != 6:
        return False, "Código no válido. Debe tener 6 caracteres."
    return True, ""

@control.route('/connectGameCode', methods=['POST'])
def connect_game_code():
    data = request.get_json()
    code = data.get('code', '').upper()
    
    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    
    if code in tableros:
        partida = buscar_partida_por_codigo(code)
        if not partida:
            new_partida = {
                "codigo": code,
                "estado": "game-setup",
            }
            current_app.mongo_db.partida.insert_one(new_partida)
        for sid in tableros[code]:
            socketio.emit('gameConnected', {"message": f"Control conectado al tablero {code}"}, to=sid, room=code)
        return jsonify({"success": True, "message": "Conexión exitosa."}), 200
    else:
        return jsonify({"success": False, "message": "El código de tablero no existe."}), 404

@control.route('/gameStatus', methods=['POST'])
def game_status():
    data = request.get_json()
    code = data.get('code', '').upper()

    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    
    partida = buscar_partida_por_codigo(code)
    if not partida:
        if code in tableros:
            new_partida = {
                "codigo": code,
                "estado": "game-setup",
            }
            current_app.mongo_db.partida.insert_one(new_partida)
            partida = new_partida
            for sid in tableros[code]:
                socketio.emit('gameConnected', {"message": f"Control conectado al tablero {code}"}, to=sid, room=code)
            return jsonify({"success": True, "status": str(partida["estado"])}), 200
        else:
            return jsonify({"success": False, "message": "El juego no existe.", "status": "disconnected"}), 404
    return jsonify({"success": True, "status": str(partida["estado"])}), 200

@control.route('/gameSetup', methods=['POST'])
def game_setup():
    data = request.get_json()
    code = data.get('code', '').upper()
    titulo = data.get('titulo', '')
    equipo1 = data.get('e1', {})
    equipo2 = data.get('e2', {})

    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    
    if not titulo or not equipo1 or not equipo2:
        return jsonify({"success": False, "message": "Datos incompletos. Se requiere el título y los datos de los dos equipos."}), 400

    partida = buscar_partida_por_codigo(code)
    
    if not partida:
        if code in tableros:
            new_partida = {
                "codigo": code,
                "estado": "game-setup",
                "titulo": titulo,
                "equipo1": equipo1,
                "equipo2": equipo2
            }
            current_app.mongo_db.partida.insert_one(new_partida)
            partida = new_partida
            for sid in tableros[code]:
                socketio.emit('gameSetup', {"message": f"Configuración del juego establecida para el tablero {code}"}, to=sid, room=code)
            return jsonify({"success": True, "message": "Configuración del juego guardada con éxito."}), 200
        else:
            return jsonify({"success": False, "message": "El código de tablero no existe."}), 404

    current_app.mongo_db.partida.update_one(
        {"codigo": code},
        {"$set": {
            "titulo": titulo,
            "equipo1": equipo1,
            "equipo2": equipo2,
            "estado": "game-selection"
        }}
    )

    socketio.emit('gameSetup', {"message": f"Configuración del juego actualizada para el tablero {code}"}, room=code)

    return jsonify({"success": True, "message": "Configuración del juego actualizada con éxito."}), 200


@control.route('/gameTeams', methods=['POST'])
def game_teams():
    data = request.get_json()
    code = data.get('code', '').upper()

    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    
    partida = buscar_partida_por_codigo(code)

    if not partida:
        return jsonify({"success": False, "message": "El juego no existe."}), 404

    equipos = {
        "titulo": partida.get('titulo', ''),
        "equipo1": partida.get('equipo1', {}),
        "equipo2": partida.get('equipo2', {}),
    }

    return jsonify({"success": True, "equipos": equipos, "estado": partida.get("estado", "unknown")}), 200
