"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { X, Zap, Star, Award, ChevronRight } from 'lucide-react'
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
}

export default function MainTablero() {
  const [teams, setTeams] = useState<Team[]>([
    { name: 'Equipo Leones', color: '#FFD700', score: 0, avatar: '🦁' },
    { name: 'Equipo Tigres', color: '#FF6B6B', score: 0, avatar: '🐯' }
  ])
  const [currentTeamIndex, setCurrentTeamIndex] = useState(0)
  const [roundScore, setRoundScore] = useState(0)
  const [strikes, setStrikes] = useState(0)
  const [question, setQuestion] = useState("¿Cuál es el planeta más grande del sistema solar?")
  const [answers, setAnswers] = useState<Answer[]>([
    { text: "Júpiter", points: 40, revealed: false },
    { text: "Saturno", points: 30, revealed: false },
    { text: "Neptuno", points: 15, revealed: false },
    { text: "Urano", points: 10, revealed: false },
    { text: "Tierra", points: 5, revealed: false }
  ])
  const [isStealingPoints, setIsStealingPoints] = useState(false)
  const [showContent, setShowContent] = useState(false)
  const [showQuestion, setShowQuestion] = useState(false)
  const [showTitle, setShowTitle] = useState(true)
  const [showLargeQuestion, setShowLargeQuestion] = useState(false)

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowTitle(false)
      setShowLargeQuestion(true)
    }, 2000)

    const timer2 = setTimeout(() => {
      setShowLargeQuestion(false)
      setShowContent(true)
    }, 7000)

    const timer3 = setTimeout(() => {
      setShowQuestion(true)
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      })
    }, 9000)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
    }
  }, [])

  const teamColors = ['from-yellow-400 to-orange-500', 'from-red-400 to-pink-500']

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    }
  }

  const titleVariants = {
    hidden: { y: -100, opacity: 0, scale: 0.5, rotate: -10 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    exit: {
      y: -100,
      opacity: 0,
      scale: 0.5,
      rotate: 10,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const largeQuestionVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2
      }
    },
    exit: {
      opacity: 0,
      transition: {
        when: "afterChildren",
        staggerChildren: 0.1,
        staggerDirection: -1
      }
    }
  }

  const wordVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    },
    exit: {
      opacity: 0,
      y: -50,
      transition: {
        type: "spring",
        stiffness: 200,
        damping: 10
      }
    }
  }

  const teamCardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 50 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: i * 0.2
      }
    })
  }

  const questionCardVariants = {
    hidden: { opacity: 0, scale: 0.8, rotateX: -90 },
    visible: {
      opacity: 1,
      scale: 1,
      rotateX: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: 0.5
      }
    }
  }

  const answerCardVariants = {
    hidden: { opacity: 0, x: -100, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        delay: i * 0.1
      }
    })
  }

  const iconVariants = {
    hidden: { scale: 0, rotate: -180 },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 260,
        damping: 20
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-4 flex flex-col overflow-hidden">
      <div className="flex-grow flex flex-col max-w-7xl mx-auto w-full relative">
        <AnimatePresence>
          {showTitle && (
            <motion.h1
              variants={titleVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="text-4xl md:text-5xl font-extrabold text-white text-center mb-4 shadow-text"
            >
              ¡Popular Choice!
            </motion.h1>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLargeQuestion && (
            <motion.div
              variants={largeQuestionVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-80 z-50"
            >
              <div className="max-w-4xl mx-auto px-4">
                <motion.h2
                  className="text-3xl md:text-5xl font-bold text-white text-center mb-8"
                  variants={wordVariants}
                >
                  Pregunta:
                </motion.h2>
                {question.split(' ').map((word, index) => (
                  <motion.span
                    key={index}
                    variants={wordVariants}
                    className="inline-block mr-2 mb-2 text-2xl md:text-4xl font-bold"
                    style={{
                      color: `hsl(${index * 30}, 80%, 60%)`,
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                    }}
                  >
                    {word}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showContent && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col h-full"
            >
              <div className="flex justify-between items-stretch mb-4 space-x-4">
                {teams.map((team, index) => (
                  <motion.div
                    key={index}
                    custom={index}
                    variants={teamCardVariants}
                    className="flex-1"
                  >
                    <Card className={`h-full bg-gradient-to-br ${teamColors[index]} text-white overflow-hidden ${index === currentTeamIndex ? 'ring-2 ring-white' : ''
                      }`}>
                      <CardContent className="p-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <motion.span
                            className="text-2xl mr-2"
                            role="img"
                            aria-label={`Avatar de ${team.name}`}
                            variants={iconVariants}
                          >
                            {team.avatar}
                          </motion.span>
                          <div>
                            <motion.h2
                              className="text-sm font-bold"
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.2 }}
                            >
                              {team.name}
                            </motion.h2>
                            <motion.div
                              className="text-xl font-extrabold"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: 0.3 }}
                            >
                              {team.score}
                            </motion.div>
                          </div>
                        </div>
                        {index === currentTeamIndex && (
                          <motion.div
                            className="flex flex-col items-end"
                            {...pulseAnimation}
                          >
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-sm font-bold flex items-center justify-center"
                            >
                              <motion.span variants={iconVariants}>
                                <Star className="h-3 w-3 mr-1 text-yellow-300" />
                              </motion.span>
                              +{roundScore}
                            </motion.div>
                            {!isStealingPoints && (
                              <div className="flex mt-1">
                                {[...Array(3)].map((_, i) => (
                                  <motion.div
                                    key={i}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                  >
                                    <Badge
                                      variant={i < strikes ? "destructive" : "outline"}
                                      className="w-3 h-3 p-0 mr-1"
                                    />
                                  </motion.div>
                                ))}
                              </div>
                            )}
                            {isStealingPoints && (
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                className="text-yellow-300 font-bold flex items-center justify-center text-xs"
                              >
                                <motion.span variants={iconVariants}>
                                  <Zap className="h-3 w-3 mr-1" />
                                </motion.span>
                                ¡Robando!
                              </motion.div>
                            )}
                          </motion.div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex-grow flex flex-col space-y-4">
                <AnimatePresence>
                  {showQuestion && (
                    <motion.div
                      variants={questionCardVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                    >
                      <Card className="bg-gradient-to-r from-green-400 to-blue-500 text-white shadow-lg rounded-xl overflow-hidden">
                        <CardContent className="p-3">
                          <motion.h3
                            className="text-lg font-bold mb-2 flex items-center justify-center"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.span variants={iconVariants}>
                              <Award className="h-5 w-5 mr-2" />
                            </motion.span>
                            Pregunta Actual
                          </motion.h3>
                          <motion.p
                            className="text-base md:text-lg font-semibold text-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                          >
                            {question}
                          </motion.p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence>
                  {showQuestion && (
                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="visible"
                      exit="hidden"
                      className="flex-grow"
                    >
                      <Card className="bg-white shadow-xl rounded-xl overflow-hidden h-full">
                        <CardContent className="p-4 h-full">
                          <motion.h3
                            className="text-xl font-bold mb-4 text-center text-purple-600 flex items-center justify-center"
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <motion.span variants={iconVariants}>
                              <Star className="h-5 w-5 mr-2 text-yellow-500" />
                            </motion.span>
                            Respuestas
                          </motion.h3>
                          <ul className="space-y-3 overflow-auto max-h-[calc(100vh-300px)]">
                            <AnimatePresence>
                              {answers.map((answer, index) => (
                                <motion.li
                                  key={index}
                                  custom={index}
                                  variants={answerCardVariants}
                                  initial="hidden"
                                  animate="visible"
                                  exit="hidden"
                                  className={`flex items-center justify-between p-3 rounded-lg ${answer.revealed ? 'bg-green-100' : 'bg-gray-100'
                                    } hover:shadow-md transition-all duration-200 transform hover:scale-105`}
                                >
                                  <div className="flex items-center">
                                    <motion.span
                                      className={`w-8 h-8 flex items-center justify-center rounded-full mr-3 text-lg font-bold ${answer.revealed ? 'bg-green-500 text-white' : 'bg-blue-500 text-white'
                                        }`}
                                      variants={iconVariants}
                                    >
                                      {index + 1}
                                    </motion.span>
                                    <span className={`text-lg ${answer.revealed ? 'font-semibold' : 'font-normal'}`}>
                                      {answer.revealed ? answer.text : `Respuesta ${index + 1}`}
                                    </span>
                                  </div>
                                  {answer.revealed && (
                                    <motion.div
                                      initial={{ scale: 0, rotate: -180 }}
                                      animate={{ scale: 1, rotate: 0 }}
                                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                    >
                                      <Badge className="text-lg bg-yellow-500 text-white px-3 py-1">
                                        {answer.points}
                                      </Badge>
                                    </motion.div>
                                  )}
                                </motion.li>
                              ))}
                            </AnimatePresence>
                          </ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}