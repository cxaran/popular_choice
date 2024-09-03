"use client"

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, QrCode, Copy, RefreshCw, Star, Zap, Trophy } from 'lucide-react'
import { QRCodeSVG } from 'qrcode.react'
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"
import type { Engine } from "@tsparticles/engine"
import { useApi } from '@/hooks/useApi';
import AppLoading from './ui/loading'

const motivationalPhrases = [
  "¡Prepárate para brillar!",
  "La diversión está por comenzar",
  "¿Listo para ser popular?",
  "Tu momento de gloria ha llegado",
  "¡Que gane el más ocurrente!"
]

interface HomePageProps {
  gameCode: string;
  onModeSelect: (newCode: string, newMode: 'tablero' | 'control') => void;
}

export function HomePage({ gameCode, onModeSelect }: HomePageProps) {
  const [inputCode, setInputCode] = useState('')
  const [init, setInit] = useState(false)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState(motivationalPhrases[0])
  const { apiUrl, hostUrl } = useApi()

  useEffect(() => {
    initParticlesEngine(async (engine: Engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
    rotateMotivationalPhrases()
  }, [])

  const handleConnect = async () => {
    if (inputCode.length !== 6) {
      setError('El código debe tener 6 caracteres.');
      return;
    }
    if (inputCode === gameCode) {
      setError('El código ingresado no puede ser igual al código del tablero actual.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(apiUrl + '/connectGameCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: inputCode }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to the game. Please try again.');
      }

      const data = await response.json();

      if (data.success) {
        onModeSelect(inputCode, 'control');
      } else {
        setError('El código no es válido. Por favor, inténtalo de nuevo.');
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred');
      }
    } finally {
      setIsLoading(false);
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(gameCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const rotateMotivationalPhrases = () => {
    let index = 0
    setInterval(() => {
      index = (index + 1) % motivationalPhrases.length
      setCurrentPhrase(motivationalPhrases[index])
    }, 5000)
  }


  const particlesOptions = {
    particles: {
      number: { value: 80, density: { enable: true, value_area: 800 } },
      color: { value: "#ffffff" },
      shape: { type: "circle" as const },
      opacity: { value: 0.5, random: true },
      size: { value: 3, random: true },
      move: {
        enable: true,
        speed: 1,
        direction: "none" as const,
        out_mode: "out" as const,
        random: true,
      }
    }
  }

  if (isLoading) {
    return <AppLoading />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {init && <Particles id="tsparticles" options={particlesOptions} className="absolute inset-0" />}
      <motion.h1
        className="text-4xl md:text-6xl font-bold text-white mb-8 relative z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Popular Choice
      </motion.h1>
      <div className="h-16 mb-4 relative overflow-hidden w-full max-w-md">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentPhrase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-white text-xl text-center absolute inset-0 flex items-center justify-center"
          >
            {currentPhrase}
          </motion.div>
        </AnimatePresence>
      </div>
      <Card className="w-full max-w-4xl relative z-10">
        <CardHeader>
          <CardTitle className="text-center flex items-center justify-center">
            <Trophy className="mr-2 h-6 w-6 text-yellow-500" />
            Bienvenido al juego
            <Trophy className="ml-2 h-6 w-6 text-yellow-500" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="board" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="board">
                <Star className="mr-2 h-4 w-4" />
                Tablero
              </TabsTrigger>
              <TabsTrigger value="control">
                <Zap className="mr-2 h-4 w-4" />
                Control
              </TabsTrigger>
            </TabsList>
            <TabsContent value="board">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-gray-100 p-4 rounded-md text-center">
                  <p className="text-sm mb-2">Código del juego:</p>
                  <div className="flex items-center justify-center space-x-2">
                    <motion.span
                      className="text-4xl font-mono font-bold tracking-wider"
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                    >
                      {gameCode}
                    </motion.span>
                    <Button variant="outline" size="icon" onClick={copyToClipboard} aria-label="Copiar código">
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-6 relative overflow-hidden">
                    <AnimatePresence>
                      {copied && (
                        <motion.p
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="text-green-500 mt-2 absolute inset-x-0"
                        >
                          ¡Código copiado!
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                <motion.div
                  className="flex justify-center"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <QRCodeSVG value={hostUrl + '/?mode=control&code=' + gameCode} size={128} />
                </motion.div>
                <p className="text-sm text-gray-600 text-center">
                  Comparte este código QR o el código del juego con los jugadores para que se unan al tablero.
                </p>
                <div className="flex justify-center">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button onClick={() => window.location.reload()} className="mt-4">
                      <RefreshCw className="mr-2 h-4 w-4" /> Generar nuevo código
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            </TabsContent>
            <TabsContent value="control">
              <motion.div
                className="space-y-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <Input
                  type="text"
                  placeholder="Ingresa el código del juego"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                  maxLength={6}
                />
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    className="w-full"
                    onClick={handleConnect}
                  >
                    <Sparkles className="mr-2 h-4 w-4" /> Conectar al juego
                  </Button>
                </motion.div>
                <div className="h-6 relative overflow-hidden">
                  <AnimatePresence>
                    {error && (
                      <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="text-red-500 text-sm text-center absolute inset-x-0"
                      >
                        {error}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
                <p className="text-sm text-gray-600 text-center">
                  Usa el control para dirigir el juego y manejar las rondas.
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      <motion.p
        className="mt-8 text-white text-center max-w-2xl relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        ¡Bienvenido a Popular Choice! Elige si quieres ser el Tablero para mostrar las preguntas y resultados,
        o el Control para manejar el juego. Se necesita un conductor para usar el Control y gestionar las rondas.
        ¡Diviértete compitiendo para adivinar las respuestas más populares!
      </motion.p>
    </div>
  )
}