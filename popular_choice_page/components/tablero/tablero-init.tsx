"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, Sparkles } from 'lucide-react'

type Team = {
  name: string
  color: string
  score: number
  avatar: string
}

type TableroInitProps = {
  titulo: string | null;
  question: string | null;
  regresive: number | null;
  teams: Team[];
};

export default function TableroInit({ titulo, question, regresive, teams }: TableroInitProps) {
  const [leadingTeam, setLeadingTeam] = useState<Team | null>(null)

  useEffect(() => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    setLeadingTeam(sortedTeams[0].score > sortedTeams[1].score ? sortedTeams[0] : null);
  }, [teams])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.3
      }
    }
  }

  const teamCardVariants = {
    hidden: { y: 50, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    }
  }

  const countdownVariants = {
    initial: { scale: 0, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0, opacity: 0 }
  }

  const questionVariants = {
    hidden: {
      rotateY: 180,
      opacity: 0,
      scale: 0.8
    },
    visible: {
      rotateY: 0,
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12,
        duration: 0.8
      }
    }
  }

  const prepareVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
    exit: { opacity: 0, scale: 1.2 }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 flex flex-col items-center justify-center relative overflow-hidden">

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl flex flex-wrap justify-center items-center gap-4 absolute top-4 left-1/2 transform -translate-x-1/2"
      >
        {teams.map((team) => (
          <motion.div
            key={team.name}
            variants={teamCardVariants}
            className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 max-w-xs"
          >
            <Card
              className={`overflow-hidden ${team === leadingTeam ? 'ring-2 ring-yellow-400' : ''}`}
              style={{
                background: `linear-gradient(135deg, ${team.color}66, ${team.color}33)`,
              }}
            >
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="flex-shrink-0">
                  <motion.span
                    className="text-4xl inline-block"
                    role="img"
                    aria-label={`Avatar de ${team.name}`}
                  >
                    {team.avatar}
                  </motion.span>
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-semibold text-white">{team.name}</h2>
                  <div className="text-2xl font-bold text-white flex items-center">
                    {team === leadingTeam && <Star className="w-5 h-5 mr-1 text-yellow-300" />}
                    {team.score}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      <div className="flex-grow flex justify-center items-center">
        <AnimatePresence mode="wait">
          {regresive === null ? (
            <motion.div
              key="prepare"
              variants={prepareVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-white text-4xl md:text-6xl font-bold text-center"
            >
              <div className="mb-4">
                <Sparkles className="w-12 h-12 mx-auto text-yellow-300 animate-pulse" />
              </div>
              ¡Prepárense!
            </motion.div>
          ) : regresive > 0 ? (
            <motion.div
              key="countdown"
              variants={countdownVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              className="text-white text-9xl md:text-[15rem] font-bold"
            >
              {regresive}
            </motion.div>
          ) : question ? (
            <motion.div
              key="question"
              variants={questionVariants}
              initial="hidden"
              animate="visible"
              className="bg-white bg-opacity-20 backdrop-blur-lg rounded-xl p-6 text-white text-2xl md:text-4xl text-center max-w-2xl relative overflow-hidden"
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
                initial={{ x: '-100%', opacity: 0 }}
                animate={{ x: '100%', opacity: 0.5 }}
                transition={{ duration: 1.5, ease: "easeInOut", delay: 0.6 }}
              />
              {question}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  )
}