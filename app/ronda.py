from flask import Blueprint, request, jsonify, current_app
from app.control import buscar_partida_por_codigo, update_board, validar_codigo
from app.sockets import tableros
from app.extensions import socketio

ronda = Blueprint('ronda', __name__)

@ronda.route('/updateGameBoard', methods=['POST'])
def update_game_board():
    data = request.get_json()
    code = data.get('code', '').upper()
    equipo1 = data.get('equipo1', {})
    equipo2 = data.get('equipo2', {})
    pregunta = data.get('pregunta', '')
    respuestas = data.get('respuestas', [])
    puntuacion_ronda = data.get('puntuacion_ronda', 0)
    equipo_actual = data.get('equipo_actual', 0)
    strike = data.get('strike', 0)
    robo_puntos = data.get('robo_puntos', False)
    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400

    partida = buscar_partida_por_codigo(code)
    if not partida:
        return jsonify({"success": False, "message": "El juego no existe."}), 404

    current_app.mongo_db.partida.update_one(
        {"codigo": code},
        {
            "$set": {
                "equipo1": equipo1,
                "equipo2": equipo2,
                "pregunta": pregunta,
                "respuestas": respuestas,
                "puntuacion_ronda": puntuacion_ronda,
                "equipo_actual": equipo_actual,
                "strike": strike,
                "robo_puntos": robo_puntos,
            }
        }
    )

    update_board(code)
    return jsonify({"success": True, "message": "Estado del juego actualizado exitosamente."}), 200


@ronda.route("/endRound", methods=["POST"])
def end_round():
    data = request.get_json()
    code = data.get('code', '').upper()
    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    partida = buscar_partida_por_codigo(code)
    if not partida:
        return jsonify({"success": False, "message": "El juego no existe."}), 404
    
    current_app.mongo_db.partida.update_one(
        {"codigo": code},
        {
            "$set": {
                "estado": "game-selection",
                "puntuacion_ronda": 0,
                "strike":0,
                "robo_puntos": False,
            },
            "$push": {
                "rondas": {
                    "equipo1": partida.get("equipo1", {}),
                    "equipo2": partida.get("equipo2", {}),
                    "pregunta": partida.get("pregunta", ""),
                    "respuestas": partida.get("respuestas", []),
                    "puntuacion_ronda": partida.get("puntuacion_ronda", 0),
                    "equipo_actual": partida.get("equipo_actual", 0),
                    "strike": partida.get("strike", 0),
                    "robo_puntos": partida.get("robo_puntos", False)
                },
                "usadas": partida.get("pregunta", ""),
            }
        }
    )
    update_board(code)
    return jsonify({"success": True, "message": "Ronda terminada y estado actualizado a 'game-control'."}), 200

