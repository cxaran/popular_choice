"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle, X, Zap, Eye, Flag, Plus, Monitor, Minus, EyeOff } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import confetti from 'canvas-confetti'
import AppLoading from '../ui/loading'
import { useApi } from '@/hooks/useApi';

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

type RoundState = 'playing' | 'stealing' | 'ended'

interface GameControlProps {
  gameCode: string;
  handleStatus: (newStatus: 'game-setup' | 'game-selection' | 'game-init' | 'game-control' | 'disconnected' | null) => void;
}

export function GameControl({ gameCode, handleStatus }: GameControlProps) {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([])
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [roundScore, setRoundScore] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [roundState, setRoundState] = useState<RoundState>('playing')
  const [question, setQuestion] = useState("")
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showStealAnimation, setShowStealAnimation] = useState(false)
  const [showSuccessfulStealAnimation, setShowSuccessfulStealAnimation] = useState(false)
  const [isStealingPoints, setIsStealingPoints] = useState(false)
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialDataLoaded, setIsInitialDataLoaded] = useState(false);
  const { apiUrl } = useApi()

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
          setTeams([gameInfo.equipo1, gameInfo.equipo2]);
          setQuestion(gameInfo.pregunta);
          setAnswers(gameInfo.respuestas);
          setRoundScore(gameInfo.puntuacion_ronda);
          setCurrentTeamIndex(gameInfo.equipo_actual);
          setStrikes(gameInfo.strike);
          setIsStealingPoints(gameInfo.robo_puntos);
          setIsInitialDataLoaded(true);
        }
      } catch (error) {
        console.error('Error fetching game status:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGameStatus();
  }, [gameCode]);

  const sendGameUpdate = async () => {
    const gameState = {
      code: gameCode,
      equipo1: teams[0],
      equipo2: teams[1],
      pregunta: question,
      respuestas: answers,
      puntuacion_ronda: roundScore,
      equipo_actual: currentTeamIndex,
      strike: strikes,
      robo_puntos: isStealingPoints,
    };

    try {
      const response = await fetch(apiUrl + '/updateGameBoard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(gameState),
      });
      if (!response.ok) {
        throw new Error('Error actualizando el estado del juego');
      }
      const data = await response.json();
      if (data.success) {
        console.log('Estado del juego actualizado exitosamente');
      } else {
        console.error('Error al actualizar el estado del juego:', data.message);
      }
    } catch (error) {
      console.error('Error al enviar la actualización del juego:', error);
    }
  };

  useEffect(() => {
    if (isInitialDataLoaded) {
      sendGameUpdate();
    }
  }, [teams, currentTeamIndex, roundScore, strikes, roundState, question, answers, isStealingPoints, isInitialDataLoaded]);


  const handleRevealAnswer = (index: number) => {
    const newAnswers = [...answers]
    if (newAnswers[index].revealed) {
      newAnswers[index].revealed = false;
      newAnswers[index].shownOnBoard = false;
      if (!isStealingPoints) {
        setRoundScore(roundScore - newAnswers[index].pts)
        const teamsNew = [...teams];
        teamsNew[currentTeamIndex].score -= newAnswers[index].pts;
        setTeams(teamsNew);
      }
    } else {
      newAnswers[index].revealed = true;
      newAnswers[index].shownOnBoard = true;
      if (isStealingPoints) {
        const newScore = roundScore + newAnswers[index].pts
        const teamsNew = [...teams];
        const teamIndex = currentTeamIndex === 0 ? 1 : 0;
        teamsNew[currentTeamIndex].score += newScore;
        teamsNew[teamIndex].score -= roundScore;
        setRoundScore(roundScore + newAnswers[index].pts)
        setTeams(teamsNew);
        handleSuccessfulSteal(newAnswers[index].pts)
      } else {
        setRoundScore(roundScore + newAnswers[index].pts)
        const teamsNew = [...teams];
        teamsNew[currentTeamIndex].score += newAnswers[index].pts;
        setTeams(teamsNew);
      }
    }
    setAnswers(newAnswers)
  }

  const handleSwitchTeam = (index: number) => {
    const teamsNew = [...teams];
    teamsNew[index].score += roundScore;
    teamsNew[currentTeamIndex].score -= roundScore;
    setTeams(teamsNew);
    setCurrentTeamIndex(index);
    console.log(`Team ${currentTeamIndex} has changed to team ${index}`);
  }

  const handleShowOnBoard = (index: number) => {
    const newAnswers = [...answers]
    newAnswers[index].shownOnBoard = !newAnswers[index].shownOnBoard
    setAnswers(newAnswers)
  }

  const handleAddStrike = () => {
    if (strikes < 3) {
      setStrikes(strikes + 1)
      if (strikes === 2) {
        setRoundState('stealing')
      }
    }
  }

  const handleRemoveStrike = () => {
    if (strikes > 0) {
      setStrikes(strikes - 1)
      if (roundState === 'stealing') {
        setRoundState('playing')
      }
    }
  }

  const handleStealPoints = () => {
    setShowStealAnimation(true)
    setTimeout(() => {
      setShowStealAnimation(false)
      setIsStealingPoints(true)
      setCurrentTeamIndex(1 - currentTeamIndex)
    }, 2000)
  }

  const handleSuccessfulSteal = (points: number) => {
    setIsStealingPoints(false)
    setRoundState('playing')
    setStrikes(0)
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    })
  }

  const handleEndRound = () => {
    setRoundState('ended')
  }

  const handleNextRound = async () => {
    await fetch(apiUrl + '/endRound', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code: gameCode }),
    })

    handleStatus("game-selection");
  }

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Control de Ronda</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {teams.map((team, index) => (
            <Card
              key={index}
              className={`${index === currentTeamIndex ? 'ring-2 ring-offset-2' : ''} transition-all duration-300 ease-in-out transform hover:scale-105`}
              style={{
                borderColor: team.color,
                backgroundColor: index === currentTeamIndex ? `${team.color}22` : 'white'
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-3xl mr-2" role="img" aria-label={`Avatar de ${team.name}`}>{team.avatar}</span>
                    <div>
                      <h3 className="font-bold text-lg" style={{ color: team.color }}>{team.name}</h3>
                      <p className="text-sm text-gray-600">Puntaje Total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-3xl font-bold" style={{ color: team.color }}>{team.score}</span>
                    {index === currentTeamIndex && (
                      <div className="text-sm font-semibold text-green-600">
                        +{roundScore}
                      </div>
                    )}
                  </div>
                </div>
                {index === currentTeamIndex && !isStealingPoints && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold">Turno Actual</p>
                    <div className="flex items-center mt-1">
                      <span className="font-bold mr-2">Strikes:</span>
                      {[...Array(3)].map((_, i) => (
                        <X
                          key={i}
                          className={`h-5 w-5 ${i < strikes ? 'text-red-500' : 'text-gray-300'} mr-1`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {index === currentTeamIndex && isStealingPoints && (
                  <div className="mt-2">
                    <p className="text-sm font-semibold text-yellow-600">Intentando Robar Puntos</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 w-full sm:w-auto">
            <Button
              onClick={handleAddStrike}
              disabled={roundState !== 'playing' || strikes >= 3 || isStealingPoints}
              variant="outline"
              className="bg-red-100 hover:bg-red-200 text-red-600 w-full xs:w-auto"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Strike
            </Button>
            <Button
              onClick={handleRemoveStrike}
              disabled={strikes === 0 || isStealingPoints}
              variant="outline"
              className="bg-blue-100 hover:bg-blue-200 text-blue-600 w-full xs:w-auto"
            >
              <Minus className="mr-2 h-4 w-4" /> Eliminar Strike
            </Button>
          </div>
          <div className="flex flex-col xs:flex-row space-y-2 xs:space-y-0 xs:space-x-2 w-full sm:w-auto">
            <Button
              onClick={() => handleSwitchTeam(currentTeamIndex === 0 ? 1 : 0)}
              disabled={roundState === 'stealing'}
              className="bg-indigo-500 hover:bg-indigo-600 text-white w-full xs:w-auto"
            >
              Cambiar equipo en turno
            </Button>
            <Button
              onClick={handleStealPoints}
              disabled={roundState !== 'stealing' || isStealingPoints}
              className="bg-yellow-500 hover:bg-yellow-600 text-white w-full xs:w-auto"
            >
              <Zap className="mr-2 h-4 w-4" /> Robar Puntos
            </Button>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-t-lg">
            <CardTitle className="text-xl sm:text-2xl font-bold text-center py-2">Pregunta Actual</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <p className="text-lg sm:text-xl font-semibold text-center break-words">{question}</p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {answers.map((answer, index) => (
            <Card key={index} className={`${answer.shownOnBoard ? 'bg-gray-100' : ''}`}>
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">{answer.respuesta}</span>
                  <Badge>{answer.pts}</Badge>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    onClick={() => handleRevealAnswer(index)}
                    disabled={(!isStealingPoints && roundState !== 'playing')}
                    className="flex-1 text-xs"
                    size="sm"
                  >
                    {answer.revealed ? (
                      <>
                        <Minus className="mr-1 h-3 w-3" /> Deseleccionar
                      </>
                    ) : (
                      <>
                        <Plus className="mr-1 h-3 w-3" /> Seleccionar
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => handleShowOnBoard(index)}
                    disabled={answer.revealed || isStealingPoints}
                    variant="outline"
                    className="flex-1 text-xs"
                    size="sm"
                  >
                    {answer.shownOnBoard ? (
                      <>
                        <EyeOff className="mr-1 h-3 w-3" /> Ocultar
                      </>
                    ) : (
                      <>
                        <Eye className="mr-1 h-3 w-3" /> Mostrar
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-end mb-6">
          <Button onClick={handleEndRound} variant="destructive" >
            <Flag className="mr-2 h-4 w-4" /> Terminar Ronda
          </Button>
        </div>

        {roundState === 'ended' && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Ronda Terminada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg mb-4">
                {teams[currentTeamIndex].name} ha ganado {roundScore} puntos en esta ronda.
              </p>
              <Button onClick={handleNextRound}>Siguiente Ronda</Button>
            </CardContent>
          </Card>
        )}

        <AnimatePresence>
          {showStealAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
              <div className="bg-white p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">¡Oportunidad de Robo!</h2>
                <p className="text-xl mb-4">{teams[1 - currentTeamIndex].name} intenta robar los puntos</p>
                <Progress value={66} className="w-64 h-4 mb-4" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showSuccessfulStealAnimation && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
            >
              <div className="bg-white p-8 rounded-lg text-center">
                <h2 className="text-2xl font-bold mb-4">¡Robo Exitoso!</h2>
                <p className="text-xl mb-4">
                  {teams[currentTeamIndex].name} ha robado {roundScore} puntos
                </p>
                <Button onClick={() => setShowSuccessfulStealAnimation(false)}>Continuar</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div >
  )
}