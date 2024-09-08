import google.generativeai as genai
import json
import os

from flask import Blueprint, request, jsonify, current_app

preguntas = Blueprint('preguntas', __name__)

def guardar_preguntas():
    file_path = os.path.join(current_app.root_path, 'preguntas.json')
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(current_app.preguntas, file, ensure_ascii=False, indent=4)

@preguntas.route('/questions', methods=['GET'])
def obtener_preguntas():
    page = int(request.args.get('page', 1))
    per_page = int(request.args.get('per_page', 10))
    categoria = request.args.get('category', 'Todas').lower()
    search = request.args.get('search', '').lower()

    preguntas = current_app.preguntas

    if categoria != 'todas':
        preguntas = [p for p in preguntas if p['tema'].lower() == categoria]

    if search:
        preguntas = [p for p in preguntas if search in p['pregunta'].lower()]

    total_preguntas = len(preguntas)
    start = (page - 1) * per_page
    end = start + per_page
    paginated_preguntas = preguntas[start:end]

    print(len(paginated_preguntas))

    return jsonify({
        "questions": paginated_preguntas,
        "totalPages": (total_preguntas + per_page - 1) // per_page 
    }), 200

@preguntas.route('/categories', methods=['GET'])
def obtener_categorias():
    categorias = {p['tema'] for p in current_app.preguntas}
    return jsonify({"categories": list(categorias)}), 200

def validar_pregunta(pregunta):
    required_keys = {'tema', 'pregunta', 'respuestas'}
    if not all(key in pregunta for key in required_keys):
        return False, "Faltan campos requeridos"
    
    if not isinstance(pregunta['respuestas'], list) or len(pregunta['respuestas']) < 1:
        return False, "La lista de respuestas debe contener al menos una respuesta"

    for respuesta in pregunta['respuestas']:
        if not all(key in respuesta for key in {'respuesta', 'pts'}):
            return False, "Cada respuesta debe tener los campos 'respuesta' y 'pts'"
        if not isinstance(respuesta['pts'], int):
            return False, "'pts' debe ser un número entero"

    return True, ""


@preguntas.route('/generar-preguntas', methods=['GET'])
def generar_preguntas():
    tema = request.args.get('tema', None)
    
    if not tema:
        return jsonify({"error": "El parámetro 'tema' es requerido"}), 400
    
    genai.configure(api_key=current_app.config["API_KEY_GEMINI"])
    
    prompt = f"""
    Estás diseñando preguntas para un juego basado en "Family Feud", un popular programa de televisión en el que se hacen preguntas a varias personas y los participantes deben adivinar las respuestas más comunes.
    
    Genera 3 preguntas en español sobre el tema "{tema}" que podrían ser usadas en este tipo de juego.
    Cada pregunta debe tener varias respuestas posibles (entre 4 y 5), y la suma total de los puntos de todas las respuestas debe ser 100.
    Las respuestas deben reflejar lo que la mayoría de las personas dirían o pensarían en relación con la pregunta.

    Estructura el JSON con este formato:

    [{{
        "tema": str,  # El tema dado en las instrucciones
        "pregunta": str,  # La pregunta que se hace a los participantes, relacionada con el tema "{tema}"
        "respuestas": [
            {{"respuesta": str, "pts": int}},  # La respuesta más común con el puntaje correspondiente
            {{"respuesta": str, "pts": int}},  # Otras respuestas con puntajes menores
            ...
        ]
    }} , ...]
    
    Asegúrate de que las preguntas sean creativas, divertidas y adecuadas para el estilo de juego de "100 Mexicanos Dijeron".
    """

    model = genai.GenerativeModel('gemini-1.5-flash',
                                  generation_config={"response_mime_type": "application/json"})
    response = model.generate_content(prompt)

    try:
        print(response.text)
        preguntas_generadas = json.loads(response.text)
    except json.JSONDecodeError:
        return jsonify({"error": "No se pudo generar preguntas válidas con la IA"}), 500
    
    for pregunta in preguntas_generadas:
        es_valida, mensaje = validar_pregunta(pregunta)
        if not es_valida:
            return jsonify({"error": f"Formato incorrecto en la pregunta generada: {mensaje}"}), 400

    return jsonify({"preguntas": preguntas_generadas}), 200
