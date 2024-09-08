"use client"

import { useState, useEffect } from 'react'
import { useApi } from '@/hooks/useApi';
import { Socket } from 'socket.io-client';
import AppLoading from '../ui/loading';
import ErrorScreen from '../ui/error';

import TableroWaiting from './tablero-waiting';
import MainTablero from './main-tablero';
import TableroInit from './tablero-init';

type Team = {
    name: string
    color: string
    score: number
    avatar: string
}

type Answer = {
    respuesta: string
    pts: number
    revealed: boolean
    shownOnBoard: boolean
}

interface TableroPageProps {
    gameCode: string;
    socketio: Socket;
}

export function TableroPage({ gameCode, socketio }: TableroPageProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'game-setup' | 'game-selection' | 'game-init' | 'game-control' | 'disconnected' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { apiUrl } = useApi()

    const [titulo, setTitulo] = useState<string | null>(null);
    const [teams, setTeams] = useState<Team[]>([])

    const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
    const [roundScore, setRoundScore] = useState(0)
    const [strikes, setStrikes] = useState(0)
    const [question, setQuestion] = useState<string | null>(null)
    const [regresive, setRegressive] = useState<number | null>(null)
    const [answers, setAnswers] = useState<Answer[]>([])
    const [isStealingPoints, setIsStealingPoints] = useState(false)

    useEffect(() => {
        console.log("Game Code:", gameCode);
        const fetchGameStatus = async () => {
            try {
                const response = await fetch(apiUrl + `/gameStatus`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code: gameCode }),
                });
                if (!response.ok) {
                    throw new Error('Failed to fetch game status');
                }
                const data = await response.json();
                if (data.success) {
                    const gameInfo = data.gameInfo;
                    setTitulo(gameInfo.titulo);
                    setTeams([gameInfo.equipo1, gameInfo.equipo2]);
                    setQuestion(gameInfo.pregunta);
                    setAnswers(gameInfo.respuestas);
                    setRoundScore(gameInfo.puntuacion_ronda);
                    setCurrentTeamIndex(gameInfo.equipo_actual);
                    setStrikes(gameInfo.strike);
                    setIsStealingPoints(gameInfo.robo_puntos);
                    setStatus(gameInfo.estado);
                    setRegressive(gameInfo.regresive);
                } else {
                    setError('Error al obtener el estado del juego. Intenta nuevamente.');
                }
            } catch (error) {
                setError('Error al conectarse con el servidor. Por favor, intenta nuevamente.');
                console.error('Error fetching game status:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchGameStatus();

        socketio.on('updateBoard', (data) => {
            console.log(data);
            setTitulo(data.titulo);
            setTeams([data.equipo1, data.equipo2]);
            setQuestion(data.pregunta);
            setAnswers(data.respuestas);
            setRoundScore(data.puntuacion_ronda);
            setCurrentTeamIndex(data.equipo_actual);
            setStrikes(data.strike);
            setIsStealingPoints(data.robo_puntos);
            setStatus(data.estado);
            setRegressive(data.regresive);
        });

    }, [gameCode]);

    if (isLoading || status === 'game-setup' || status === null) {
        return <AppLoading />;
    }

    if (error) {
        return <ErrorScreen error={error} />;
    }

    return (
        <>
            {status === 'game-selection' && <TableroWaiting gameCode={gameCode} titulo={titulo} teams={teams} />}
            {status === 'game-init' && <TableroInit titulo={titulo} question={question} regresive={regresive} teams={teams} />}
            {status === 'game-control' && <MainTablero
                titulo={titulo}
                gameCode={gameCode}
                teams={teams}
                currentTeamIndex={currentTeamIndex}
                roundScore={roundScore}
                strikes={strikes}
                question={question}
                answers={answers}
                isStealingPoints={isStealingPoints}
            />}
        </>

    )
}