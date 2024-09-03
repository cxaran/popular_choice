"use client"

import { useState, useEffect } from 'react'
import { motion } from "framer-motion"
import { Lightbulb, Brain, Trophy, Star } from "lucide-react"
import { Progress } from "@/components/ui/progress"

const loadingPhrases = [
  "Calentando neuronas...",
  "Activando modo genio...",
  "Preparando preguntas desafiantes...",
  "Cargando conocimientos infinitos...",
  "Sincronizando con la base de datos del saber...",
]

const iconVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

export default function AppLoading() {
  const [progress, setProgress] = useState(0)
  const [currentPhrase, setCurrentPhrase] = useState(loadingPhrases[0])

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prevProgress) => {
        if (prevProgress >= 100) {
          clearInterval(timer)
          return 100
        }
        return prevProgress + 1
      })
    }, 50)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const phraseInterval = setInterval(() => {
      setCurrentPhrase((prevPhrase) => {
        const currentIndex = loadingPhrases.indexOf(prevPhrase)
        return loadingPhrases[(currentIndex + 1) % loadingPhrases.length]
      })
    }, 3000)

    return () => clearInterval(phraseInterval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex flex-col items-center justify-center p-4">
      <motion.div
        className="bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-8 max-w-md w-full"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold text-white text-center mb-6">Cargando el Desafío</h2>

        <div className="flex justify-center space-x-4 mb-6">
          <motion.div variants={iconVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Lightbulb className="w-10 h-10 text-yellow-300" />
          </motion.div>
          <motion.div variants={iconVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
            <Brain className="w-10 h-10 text-blue-300" />
          </motion.div>
          <motion.div variants={iconVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
            <Trophy className="w-10 h-10 text-yellow-500" />
          </motion.div>
          <motion.div variants={iconVariants} initial="hidden" animate="visible" transition={{ delay: 0.8 }}>
            <Star className="w-10 h-10 text-pink-300" />
          </motion.div>
        </div>

        <Progress value={progress} className="mb-4" />

        <motion.p
          className="text-white text-center text-lg mb-4"
          key={currentPhrase}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          {currentPhrase}
        </motion.p>

        <p className="text-white text-center text-sm">
          Prepárate para poner a prueba tus conocimientos
        </p>
      </motion.div>
    </div>
  )
}