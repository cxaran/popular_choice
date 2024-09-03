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

type Team = {
  name: string
  color: string
  score: number
  avatar: string
}

type Answer = {
  text: string
  points: number
  revealed: boolean
  shownOnBoard: boolean
}

type RoundState = 'playing' | 'stealing' | 'ended'

export function GameControl() {
  const router = useRouter()
  const [teams, setTeams] = useState<Team[]>([
    { name: 'Equipo 1', color: '#FF0000', score: 0, avatar: '🦁' },
    { name: 'Equipo 2', color: '#0000FF', score: 0, avatar: '🐯' }
  ])
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [roundScore, setRoundScore] = useState(0)
  const [stealScore, setStealScore] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [roundState, setRoundState] = useState<RoundState>('playing')
  const [question, setQuestion] = useState("¿Cuál es el planeta más grande del sistema solar?")
  const [answers, setAnswers] = useState<Answer[]>([
    { text: "Júpiter", points: 40, revealed: false, shownOnBoard: false },
    { text: "Saturno", points: 30, revealed: false, shownOnBoard: false },
    { text: "Neptuno", points: 15, revealed: false, shownOnBoard: false },
    { text: "Urano", points: 10, revealed: false, shownOnBoard: false },
    { text: "Tierra", points: 5, revealed: false, shownOnBoard: false }
  ])
  const [showStealAnimation, setShowStealAnimation] = useState(false)
  const [showSuccessfulStealAnimation, setShowSuccessfulStealAnimation] = useState(false)
  const [isStealingPoints, setIsStealingPoints] = useState(false)

  const handleRevealAnswer = (index: number) => {
    const newAnswers = [...answers]
    if (newAnswers[index].revealed) {
      // Deseleccionar la respuesta
      newAnswers[index].revealed = false
      if (isStealingPoints) {
        setStealScore(stealScore - newAnswers[index].points)
      } else {
        setRoundScore(roundScore - newAnswers[index].points)
      }
    } else {
      // Seleccionar la respuesta
      newAnswers[index].revealed = true
      newAnswers[index].shownOnBoard = true
      if (isStealingPoints) {
        setStealScore(stealScore + newAnswers[index].points)
        handleSuccessfulSteal(newAnswers[index].points)
      } else {
        setRoundScore(roundScore + newAnswers[index].points)
      }
    }
    setAnswers(newAnswers)
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
    const totalStolenPoints = stealScore + points
    setShowSuccessfulStealAnimation(true)
    const newTeams = [...teams]
    newTeams[currentTeamIndex].score += totalStolenPoints
    setTeams(newTeams)
    setRoundScore(0)
    setStealScore(0)
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
    const newTeams = [...teams]
    newTeams[currentTeamIndex].score += roundScore
    setTeams(newTeams)
    setRoundState('ended')
  }

  const handleNextRound = () => {
    // Reset round state and navigate to question selection
    router.push('/question-selection')
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
                        +{isStealingPoints ? stealScore : roundScore}
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

        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-2">
            <Button
              onClick={handleAddStrike}
              disabled={roundState !== 'playing' || strikes >= 3 || isStealingPoints}
              variant="outline"
              className="bg-red-100 hover:bg-red-200 text-red-600"
            >
              <Plus className="mr-2 h-4 w-4" /> Agregar Strike
            </Button>
            <Button
              onClick={handleRemoveStrike}
              disabled={strikes === 0 || isStealingPoints}
              variant="outline"
              className="bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              <Minus className="mr-2 h-4 w-4" /> Eliminar Strike
            </Button>
          </div>
          <Button
            onClick={handleStealPoints}
            disabled={roundState !== 'stealing' || isStealingPoints}
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
          >
            <Zap className="mr-2 h-4 w-4" /> Robar Puntos
          </Button>
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
                  <span className="font-bold">{answer.revealed ? answer.text : `Respuesta ${index + 1}`}</span>
                  <Badge>{answer.points}</Badge>
                </div>
                <div className="flex justify-between gap-2">
                  <Button
                    onClick={() => handleRevealAnswer(index)}
                    disabled={answer.revealed || (!isStealingPoints && roundState !== 'playing')}
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
          <Button onClick={handleEndRound} variant="destructive" disabled={isStealingPoints}>
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
                  {teams[currentTeamIndex].name} ha robado {stealScore} puntos
                </p>
                <Button onClick={() => setShowSuccessfulStealAnimation(false)}>Continuar</Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}