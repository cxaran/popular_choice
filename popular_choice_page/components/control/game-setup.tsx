"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AlertCircle } from 'lucide-react'
import { HexColorPicker } from "react-colorful"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

import { useApi } from '@/hooks/useApi';

type Team = {
  name: string
  color: string
  avatar: string
  score: number
}

interface GameSetupProps {
  gameCode: string;
  handleStatus: (newStatus: 'game-setup' | 'game-selection' | 'game-init' | 'game-control' | 'disconnected' | null) => void;
}

const avatars = {
  animals: [
    { icon: '🦁', name: 'León' }, { icon: '🐯', name: 'Tigre' }, { icon: '🐘', name: 'Elefante' },
    { icon: '🦊', name: 'Zorro' }, { icon: '🐼', name: 'Panda' }, { icon: '🦅', name: 'Águila' },
    { icon: '🐬', name: 'Delfín' }, { icon: '🦜', name: 'Loro' }, { icon: '🦀', name: 'Cangrejo' },
    { icon: '🐙', name: 'Pulpo' }, { icon: '🦋', name: 'Mariposa' }, { icon: '🦚', name: 'Pavo Real' },
    { icon: '🦘', name: 'Canguro' }, { icon: '🦒', name: 'Jirafa' }, { icon: '🐸', name: 'Rana' },
    { icon: '🦉', name: 'Búho' }, { icon: '🦈', name: 'Tiburón' }, { icon: '🦙', name: 'Llama' },
    { icon: '🦥', name: 'Perezoso' }, { icon: '🦔', name: 'Erizo' }
  ],
  mythical: [
    { icon: '🦄', name: 'Unicornio' }, { icon: '🐲', name: 'Dragón' }, { icon: '🧚', name: 'Hada' },
    { icon: '🧜‍♀️', name: 'Sirena' }, { icon: '🧛', name: 'Vampiro' }, { icon: '🧙‍♂️', name: 'Mago' },
    { icon: '🧞‍♂️', name: 'Genio' }, { icon: '🦕', name: 'Dinosaurio' }, { icon: '🦖', name: 'T-Rex' },
    { icon: '🔮', name: 'Bola de Cristal' }, { icon: '👻', name: 'Fantasma' }, { icon: '🤖', name: 'Robot' }
  ],
  objects: [
    { icon: '⚽', name: 'Fútbol' }, { icon: '🏀', name: 'Baloncesto' }, { icon: '🎸', name: 'Guitarra' },
    { icon: '🎮', name: 'Videojuego' }, { icon: '📚', name: 'Libros' }, { icon: '🎨', name: 'Paleta de Pintor' },
    { icon: '🍕', name: 'Pizza' }, { icon: '🍦', name: 'Helado' }, { icon: '🚀', name: 'Cohete' },
    { icon: '💎', name: 'Diamante' }, { icon: '🎭', name: 'Teatro' }, { icon: '🎬', name: 'Cine' },
    { icon: '🔬', name: 'Microscopio' }, { icon: '🎻', name: 'Violín' }, { icon: '🎳', name: 'Bolos' }
  ],
  nature: [
    { icon: '🌵', name: 'Cactus' }, { icon: '🌻', name: 'Girasol' }, { icon: '🌳', name: 'Árbol' },
    { icon: '🌋', name: 'Volcán' }, { icon: '🌊', name: 'Ola' }, { icon: '🌈', name: 'Arcoíris' },
    { icon: '🍄', name: 'Hongo' }, { icon: '🌙', name: 'Luna' }, { icon: '⭐', name: 'Estrella' },
    { icon: '🔥', name: 'Fuego' }, { icon: '❄️', name: 'Copo de Nieve' }, { icon: '🌴', name: 'Palmera' }
  ]
}

export function GameSetup({ gameCode, handleStatus }: GameSetupProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [teams, setTeams] = useState<Team[]>([
    { name: '', color: '#FF0000', score: 0, avatar: '🦁' },
    { name: '', color: '#0000FF', score: 0, avatar: '🐯' }
  ])
  const [error, setError] = useState('')
  const { apiUrl } = useApi()

  const handleTeamChange = (index: number, field: keyof Team, value: string) => {
    const newTeams = [...teams]
    newTeams[index] = { ...newTeams[index], [field]: value }
    setTeams(newTeams)
  }

  const handleStartGame = async () => {
    if (title.trim() === '') {
      setError('Por favor, ingresa un título para la partida.')
      return
    }

    if (teams[0].name && teams[1].name) {
      if (teams[0].color === teams[1].color) {
        setError('Los colores de los equipos deben ser diferentes.')
        return
      }
      if (teams[0].avatar === teams[1].avatar) {
        setError('Los avatares de los equipos deben ser diferentes.')
        return
      }

      try {
        const response = await fetch(apiUrl + '/gameSetup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            code: gameCode,
            titulo: title,
            e1: teams[0],
            e2: teams[1],
          }),
        });

        if (!response.ok) {
          const result = await response.json();
          setError(result.message || 'Ocurrió un error al iniciar la partida.');
        } else {
          handleStatus('game-selection');
        }
      } catch (error) {
        setError('Error al conectar con el servidor. Por favor, intenta nuevamente.');
      }

    } else {
      setError('Por favor, ingresa nombres para ambos equipos.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Configuración de Partida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="gameTitle" className="text-xl font-semibold">Título de la Partida</Label>
              <Input
                id="gameTitle"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ingresa el título de la partida"
              />
            </div>
            {teams.map((team, index) => (
              <div key={index} className="space-y-4">
                <h3 className="text-xl font-semibold">Equipo {index + 1}</h3>
                <div className="space-y-2">
                  <Label htmlFor={`team${index + 1}Name`}>Nombre del Equipo</Label>
                  <Input
                    id={`team${index + 1}Name`}
                    value={team.name}
                    onChange={(e) => handleTeamChange(index, 'name', e.target.value)}
                    placeholder={`Nombre del Equipo ${index + 1}`}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div>
                    <Label htmlFor={`team${index + 1}Color`}>Color del Equipo</Label>
                    <Dialog>
                      <DialogTrigger asChild>
                        <div
                          className="w-10 h-10 rounded-full cursor-pointer border-2 border-gray-300 hover:border-gray-400 transition-colors mt-2"
                          style={{ backgroundColor: team.color }}
                          aria-label="Seleccionar color del equipo"
                        />
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Elige el color del equipo</DialogTitle>
                        </DialogHeader>
                        <HexColorPicker
                          color={team.color}
                          onChange={(color) => handleTeamChange(index, 'color', color)}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="flex-1">
                    <Label htmlFor={`team${index + 1}Avatar`}>Avatar del Equipo</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="outline" className="w-full mt-2">
                          <span className="mr-2 text-2xl">{team.avatar}</span>
                          Seleccionar Avatar
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80">
                        <Tabs defaultValue="animals">
                          <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="animals">Animales</TabsTrigger>
                            <TabsTrigger value="mythical">Míticos</TabsTrigger>
                            <TabsTrigger value="objects">Objetos</TabsTrigger>
                            <TabsTrigger value="nature">Naturaleza</TabsTrigger>
                          </TabsList>
                          {Object.entries(avatars).map(([category, categoryAvatars]) => (
                            <TabsContent key={category} value={category}>
                              <ScrollArea className="h-72">
                                <div className="grid grid-cols-4 gap-2 p-2">
                                  {categoryAvatars.map((avatar) => (
                                    <Button
                                      key={avatar.icon}
                                      variant="ghost"
                                      className="h-12 w-12 p-0"
                                      onClick={() => handleTeamChange(index, 'avatar', avatar.icon)}
                                    >
                                      <span className="text-2xl" role="img" aria-label={avatar.name}>
                                        {avatar.icon}
                                      </span>
                                    </Button>
                                  ))}
                                </div>
                              </ScrollArea>
                            </TabsContent>
                          ))}
                        </Tabs>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center space-x-2 text-red-500 mb-4"
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}
          <Button onClick={handleStartGame} className="w-full">Iniciar Juego</Button>
        </CardFooter>
      </Card>
    </div>
  )
}