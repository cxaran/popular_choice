"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Play } from 'lucide-react'

type Team = {
  name: string
  color: string
  avatar: string
}

export function GameInit() {
  const router = useRouter()
  const [teams] = useState<Team[]>([
    { name: 'Equipo 1', color: '#FF0000', avatar: '🦁' },
    { name: 'Equipo 2', color: '#0000FF', avatar: '🐯' }
  ])
  const [showQuestion, setShowQuestion] = useState(false)
  const [timer, setTimer] = useState(10)
  const [questionRevealed, setQuestionRevealed] = useState(false)
  const [winningTeam, setWinningTeam] = useState<number | null>(null)
  const [question, setQuestion] = useState("¿Cuál es la capital de Francia?")

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (showQuestion && timer > 0) {
      interval = setInterval(() => {
        setTimer((prevTimer) => prevTimer - 1)
      }, 1000)
    } else if (timer === 0) {
      setQuestionRevealed(true)
    }
    return () => clearInterval(interval)
  }, [showQuestion, timer])

  const handleShowQuestion = () => {
    setShowQuestion(true)
  }

  const handleTeamButtonClick = (teamIndex: number) => {
    if (questionRevealed && winningTeam === null) {
      setWinningTeam(teamIndex)
      // Navegar a la página de control de ronda después de un breve retraso
      setTimeout(() => {
        router.push('/round-control')
      }, 2000)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-8 flex items-center justify-center">
      <Card className="w-full max-w-4xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Inicio de Ronda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {teams.map((team, index) => (
              <Button
                key={index}
                onClick={() => handleTeamButtonClick(index)}
                disabled={!questionRevealed || winningTeam !== null}
                className="h-32 text-xl font-bold transition-all duration-300 ease-in-out transform hover:scale-105 flex flex-col items-center justify-center"
                style={{
                  backgroundColor: team.color,
                  opacity: winningTeam === null || winningTeam === index ? 1 : 0.5
                }}
              >
                <span className="text-6xl mb-2" role="img" aria-label={`Avatar de ${team.name}`}>
                  {team.avatar}
                </span>
                <span className="text-white text-shadow">{team.name}</span>
              </Button>
            ))}
          </div>

          {!showQuestion && (
            <Button
              onClick={handleShowQuestion}
              className="w-full h-16 text-xl font-bold bg-green-500 hover:bg-green-600 flex items-center justify-center"
            >
              <Play className="mr-2 h-8 w-8" /> Mostrar Pregunta
            </Button>
          )}

          <AnimatePresence>
            {showQuestion && (
              <motion.div
                key="question-timer"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center"
              >
                {timer > 0 ? (
                  <motion.div
                    key="timer"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-6xl font-bold mb-4"
                  >
                    {timer}
                  </motion.div>
                ) : (
                  <motion.div
                    key="question"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-2xl font-semibold bg-white text-black p-4 rounded-lg shadow-lg"
                  >
                    {question}
                  </motion.div>
                )}
                {!questionRevealed ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl font-semibold mt-4"
                  >
                    La pregunta se revelará en breve...
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-xl font-semibold mt-4"
                  >
                    ¡Pregunta Revelada! Equipos, ¡pulsen su botón!
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {winningTeam !== null && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-2xl font-bold"
            >
              ¡{teams[winningTeam].name} comienza la ronda!
            </motion.div>
          )}

          <div className="text-center text-sm text-gray-500">
            <AlertCircle className="inline-block mr-1 h-4 w-4" />
            Espere a que se revele la pregunta antes de pulsar el botón de su equipo.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}