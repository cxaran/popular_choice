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

def update_board(code):
    partida = buscar_partida_por_codigo(code)
    if not partida:
        return
    game_info = {
        "codigo": partida.get("codigo", ""),
        "estado": partida.get("estado", "unknown"),
        "titulo": partida.get("titulo", ""),
        "equipo1": partida.get("equipo1", {}),
        "equipo2": partida.get("equipo2", {}),
        "pregunta": partida.get("pregunta", ""),
        "respuestas": partida.get("respuestas", []),
        "puntuacion_ronda": partida.get("puntuacion_ronda", 0),
        "equipo_actual": partida.get("equipo_actual", 0),
        "strike": partida.get("strike", 0),
        "robo_puntos": partida.get("robo_puntos", False),
        "regresive": partida.get("regresive", None)
    }
    try:
        for sid in tableros[code]:
            socketio.emit("updateBoard", game_info, to=sid, room=code)
    except KeyError:
        pass


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
            socketio.emit('gameConnected', {"code": code}, to=sid, room=code)
        return jsonify({"success": True, "message": "Conexión exitosa."}), 200
    else:
        return jsonify({"success": False, "message": "El código de tablero no existe."}), 404

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

    update_board(code)

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

    print(partida.get('usadas'))
    equipos = {
        "titulo": partida.get('titulo', ''),
        "equipo1": partida.get('equipo1', {}),
        "equipo2": partida.get('equipo2', {}),
        "questions": partida.get('usadas', []),
    }

    return jsonify({"success": True, "equipos": equipos, "estado": partida.get("estado", "unknown")}), 200

@control.route('/setScores', methods=['POST'])
def set_scores():
    data = request.get_json()
    code = data.get('code', '').upper()
    scoreFrist = data.get('scoreFrist', 0)
    scoreSecond = data.get('scoreSecond', 0)
    print(scoreFrist, scoreSecond)
    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    partida = buscar_partida_por_codigo(code)
    if not partida:
        return jsonify({"success": False, "message": "El juego no existe."}), 404
    equipo1 = partida.get('equipo1', {})
    equipo1['score'] = scoreFrist
    equipo2 = partida.get('equipo2', {})
    equipo2['score'] = scoreSecond
    current_app.mongo_db.partida.update_one(
        {"codigo": code},
        {"$set": {
            "equipo1": equipo1,
            "equipo2": equipo2
        }}
    )
    update_board(code)
    return jsonify({"success": True, "message": "Puntuaciones actualizadas exitosamente."}), 200

@control.route('/gameAddQuestion', methods=['POST'])
def game_question():
    data = request.get_json()
    code = data.get('code', '').upper()
    pregunta = data.get('pregunta', {})
    respuestas = pregunta.get('respuestas', [])
    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    partida = buscar_partida_por_codigo(code)
    if not partida:
        return jsonify({"success": False, "message": "El juego no existe."}), 404
    if not pregunta or not pregunta.get('pregunta', '').strip():
        return jsonify({"success": False, "message": "La pregunta no puede estar vacía."}), 400
    if not respuestas or len(respuestas) == 0:
        return jsonify({"success": False, "message": "La pregunta debe tener al menos una respuesta."}), 400
    for respuesta in respuestas:
        if not respuesta.get('respuesta', '').strip():
            return jsonify({"success": False, "message": "Todas las respuestas deben tener un texto."}), 400
        if respuesta.get('pts', -1) < 0:
            return jsonify({"success": False, "message": "Las puntuaciones deben ser mayores o iguales a 0."}), 400
    current_app.mongo_db.partida.update_one(
        {"codigo": code},
        {"$set": {
            "regresive": None,
            "pregunta": pregunta.get('pregunta', ''),
            "respuestas": respuestas,
            "estado": "game-init"
        }}
    )
    update_board(code)
    return jsonify({"success": True, "message": "Pregunta agregada y el estado del juego ha cambiado a 'game-init'."}), 200

@control.route("/gameRegressive", methods=["POST"])
def init_game_regressive():
    data = request.get_json()
    code = data.get('code', '').upper()
    regresive = data.get('regresive', 10)
    print(regresive)
    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    partida = buscar_partida_por_codigo(code)
    if not partida:
        return jsonify({"success": False, "message": "El juego no existe."}), 404
    current_app.mongo_db.partida.update_one(
        {"codigo": code},
        {"$set": {
            "regresive": regresive
        }}
    )
    update_board(code)
    return jsonify({"success": True, "message": "Regresivas actualizadas y el estado del juego ha cambiado a 'game-init'."}), 200

@control.route("/gameInitControl", methods=["POST"])
def init_game_control():
    data = request.get_json()
    code = data.get('code', '').upper()
    team = data.get('team', 0)
    es_valido, mensaje = validar_codigo(code)
    if not es_valido:
        return jsonify({"success": False, "message": mensaje}), 400
    partida = buscar_partida_por_codigo(code)
    if not partida:
        return jsonify({"success": False, "message": "El juego no existe."}), 404
    current_app.mongo_db.partida.update_one(
        {"codigo": code},
        {"$set": {
            "estado": "game-control",
            "equipo_actual": team
        }}
    )
    update_board(code)
    return jsonify({"success": True, "message": "Estado del juego actualizado a 'game-control'."}), 200
