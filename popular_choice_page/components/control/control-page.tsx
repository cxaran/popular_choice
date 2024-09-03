"use client"

import { useState, useEffect } from 'react';
import { GameSetup } from "./game-setup";
import { GameSelection } from "./game-selection";
import { GameInit } from "./game-init";
import { GameControl } from "./game-control";
import { useApi } from '@/hooks/useApi';

import AppLoading from '../ui/loading';
import ErrorScreen from '../ui/error';

type Team = {
    name: string
    color: string
    score: number
    avatar: string
}


export function ControlPage({ gameCode }: { gameCode: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [status, setStatus] = useState<'game-setup' | 'game-selection' | 'game-init' | 'game-control' | 'disconnected' | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { apiUrl } = useApi()

    const [teams, setTeams] = useState<Team[]>([
        { name: 'Equipo Leones', color: '#FFD700', score: 0, avatar: '🦁' },
        { name: 'Equipo Tigres', color: '#FF6B6B', score: 0, avatar: '🐯' }
    ])

    useEffect(() => {
        console.log("Game Code:", gameCode);
        fetchGameStatus();
    }, [gameCode]);

    const fetchGameStatus = async () => {
        setIsLoading(true);
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
            if (data.status) {
                if (data.status === 'disconnected' || !data.status) {
                    setError('Conexión perdida. Por favor, recarga la página.');
                } else {
                    if (data.status === 'game-setup' || data.status === 'game-selection' || data.status === 'game-init' || data.status === 'game-control') {
                        setStatus(data.status);
                    } else {
                        setError('Estado no válido. Por favor, recarga la página o reinicie la partida.');
                    }
                }
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

    const handleStatus = (newStatus: 'game-setup' | 'game-selection' | 'game-init' | 'game-control' | 'disconnected' | null) => {
        fetchGameStatus();
    };

    if (isLoading) {
        return <AppLoading />;
    }

    if (error) {
        return <ErrorScreen error={error} />;
    }

    return (
        <>
            {status === 'game-setup' && <GameSetup gameCode={gameCode} handleStatus={handleStatus} />}
            {status === 'game-selection' && <GameSelection gameCode={gameCode} handleStatus={handleStatus} />}
            {status === 'game-init' && <GameInit />}
            {status === 'game-control' && <GameControl />}
        </>
    );
}
