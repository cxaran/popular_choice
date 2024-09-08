from flask import Blueprint, request, jsonify, current_app
from app.control import buscar_partida_por_codigo, validar_codigo
from app.sockets import tableros
from app.extensions import socketio

tablero = Blueprint('tablero', __name__)
@tablero.route('/gameStatus', methods=['POST'])
def game_status():
    data = request.get_json()
    code = data.get('code', '').upper()
    print(code)

    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    
    partida = buscar_partida_por_codigo(code)
    if not partida:
        if code in tableros:
            new_partida = {
                "titulo": "Game",
                "codigo": code,
                "estado": "game-setup",
                "equipo1": {},
                "equipo2": {},
                "pregunta": "",
                "respuestas": [],
                "puntuacion_ronda": 0,
                "equipo_actual": 0,
                "strike": 0,
                "robo_puntos": False,
                "regresive": None
            }
            current_app.mongo_db.partida.insert_one(new_partida)
            partida = new_partida
            for sid in tableros[code]:
                socketio.emit('gameConnected', {"code": code}, to=sid, room=code)
        else:
            return jsonify({"success": False, "message": "El juego no existe.", "estado": "disconnected"}), 404

    game_info = {
        "codigo": partida.get("codigo", ""),
        "estado": partida.get("estado", "unknown"),
        "titulo": partida.get("titulo", ""),
        "equipo1": partida.get("equipo1", {}),
        "equipo2": partida.get("equipo2", {}),
        "pregunta": partida.get("pregunta", ""),
        "respuestas": partida.get("respuestas", []),
        "regresive": partida.get("regresive", None),
        "puntuacion_ronda": partida.get("puntuacion_ronda", 0),
        "equipo_actual": partida.get("equipo_actual", 0), 
        "strike": partida.get("strike", 0),
        "robo_puntos": partida.get("robo_puntos", False)
    }

    return jsonify({"success": True, "gameInfo": game_info}), 200



