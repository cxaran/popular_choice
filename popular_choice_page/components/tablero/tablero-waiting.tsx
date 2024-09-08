"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import { Card, CardContent } from "@/components/ui/card"
import { Trophy, Star, ArrowRight, RotateCcw } from 'lucide-react'
import { Button } from '../ui/button'

type Team = {
  name: string
  color: string
  score: number
  avatar: string
}

type TableroWaitingProps = {
  gameCode: string;
  titulo: string | null;
  teams: Team[];
};

export default function TableroWaiting({ gameCode, titulo, teams }: TableroWaitingProps) {
  const [leadingTeam, setLeadingTeam] = useState<Team | null>(null)
  const controls = [useAnimation(), useAnimation()]

  useEffect(() => {
    const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
    if (sortedTeams.length > 1 && sortedTeams[0].score === sortedTeams[1].score) {
      setLeadingTeam(null);
    } else {
      setLeadingTeam(sortedTeams[0]);
    }

    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * 2)
      controls[randomIndex].start({
        rotate: [0, 360, 720, 1080, 0],
        transition: { duration: 2, ease: "easeInOut" }
      })
    }, 20000)

    return () => clearInterval(interval)
  }, [teams])

  const handleReset = () => {
    localStorage.clear()
    sessionStorage.clear()
    window.location.reload()
  }

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

  const scoreVariants = {
    hidden: { scale: 0 },
    visible: {
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 10
      }
    }
  }

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  const orbitAnimation = {
    rotate: 360,
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }

  const dotVariants = {
    initial: { scale: 0 },
    animate: { scale: 1 },
    exit: { scale: 0 }
  }

  const dotTransition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut"
  }

  const emojiVariants = {
    initial: { y: 0, opacity: 1 },
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  }

  const rotateAnimation = {
    rotate: [-5, 5, -5],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: "easeInOut"
    }
  }

  const shakeAnimation = {
    x: [-3, 3, -3, 3, 0],
    transition: {
      duration: 0.5,
      repeat: Infinity,
      repeatDelay: 2
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 p-4 flex flex-col items-center justify-center">
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-white mb-12 text-center"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        {titulo}
      </motion.h1>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-5xl flex flex-col md:flex-row items-center justify-center gap-8"
      >
        {teams.map((team, index) => (
          <motion.div
            key={team.name}
            variants={teamCardVariants}
            className="w-full md:w-2/5"
          >
            <Card
              className={`overflow-hidden ${team === leadingTeam ? 'ring-4 ring-yellow-400' : ''}`}
              style={{
                background: `linear-gradient(135deg, ${team.color}, ${team.color}66)`,
              }}
            >
              <CardContent className="p-6 flex flex-col items-center">
                <motion.div
                  className="relative"
                  variants={emojiVariants}
                  initial="initial"
                  animate="animate"
                >
                  <motion.span
                    className="text-7xl mb-4 inline-block"
                    role="img"
                    aria-label={`Avatar de ${team.name}`}
                    animate={controls[index]}
                    {...(team === leadingTeam ? rotateAnimation : shakeAnimation)}
                  >
                    {team.avatar}
                  </motion.span>
                  {team === leadingTeam && (
                    <motion.div
                      className="absolute -top-2 -right-2 text-2xl"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      👑
                    </motion.div>
                  )}
                </motion.div>
                <h2 className="text-2xl font-bold text-white text-center mb-2">{team.name}</h2>
                {team === leadingTeam && (
                  <div className="flex items-center text-yellow-300 mb-4">
                    <Trophy className="w-6 h-6 mr-2" />
                    <span className="text-lg font-semibold">Liderando</span>
                  </div>
                )}
                <motion.div
                  className="text-5xl font-bold text-white flex items-center"
                  variants={scoreVariants}
                  {...(team === leadingTeam ? pulseAnimation : {})}
                >
                  {team === leadingTeam && <Star className="w-8 h-8 mr-2 text-yellow-300" />}
                  {team.score}
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="hidden md:block"
        >
          <ArrowRight className="w-16 h-16 text-white" />
        </motion.div>
      </motion.div>

      <motion.div
        className="mt-12 flex flex-col items-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <motion.div className="relative w-20 h-20 mb-8" animate={orbitAnimation}>
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="absolute w-4 h-4 bg-white rounded-full"
              style={{
                top: `${50 - 40 * Math.sin(2 * Math.PI * index / 3)}%`,
                left: `${50 - 40 * Math.cos(2 * Math.PI * index / 3)}%`,
              }}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{
                ...dotTransition,
                delay: index * 0.15
              }}
            />
          ))}
        </motion.div>
        <p className="text-white text-2xl text-center">
          Preparando la siguiente ronda
        </p>
        <motion.div className="flex mt-2">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              className="w-2 h-2 bg-white rounded-full mx-1"
              initial={{ opacity: 0.3 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: "reverse",
                delay: index * 0.2
              }}
            />
          ))}
        </motion.div>
      </motion.div>
      <Button
        onClick={handleReset}
        className="bg-red-500 hover:bg-red-600 text-white mt-8"
      >
        <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Partida: {gameCode}
      </Button>
    </div>
  )
}