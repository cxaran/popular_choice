import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Search, Plus, Trophy, Edit, Flag, Eye } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { useApi } from '@/hooks/useApi';

type Question = {
  id: string
  tema: string
  pregunta: string
  used: boolean
  respuestas?: { respuesta: string, pts: number }[]
}

type Team = {
  name: string
  color: string
  score: number
  avatar: string
}

interface GameSelectionProps {
  gameCode: string;
  handleStatus: (newStatus: 'game-setup' | 'game-selection' | 'game-init' | 'game-control' | 'disconnected' | null) => void;
}

export function GameSelection({ gameCode, handleStatus }: GameSelectionProps) {
  const [filteredQuestions, setFilteredQuestions] = useState<Question[]>([])
  const [usedQuestions, setUsedQuestions] = useState<string[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Todas')
  const [categories, setCategories] = useState<string[]>(["Todas"])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [teams, setTeams] = useState<Team[]>([])
  const [newQuestion, setNewQuestion] = useState<Question>({
    id: '',
    tema: '',
    pregunta: '',
    used: false,
    respuestas: [{ respuesta: '', pts: 0 }]
  })
  const [viewResponses, setViewResponses] = useState<Question | null>(null)
  const [error, setError] = useState('')
  const [isEditingScore, setIsEditingScore] = useState(false)
  const [editedScores, setEditedScores] = useState<number[]>([])
  const [loading, setLoading] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([])
  const [topicInput, setTopicInput] = useState('')

  const { apiUrl } = useApi()

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        const response = await fetch(apiUrl + '/gameTeams', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code: gameCode }),
        });
        if (!response.ok) throw new Error('Error al obtener los datos del equipo');
        const data = await response.json();
        console.log(data);
        if (data.success) {
          setTeams([
            { ...teams[0], ...data.equipos.equipo1 },
            { ...teams[1], ...data.equipos.equipo2 },
          ]);
          setUsedQuestions(data.equipos.questions);
        } else {
          setError(data.message || 'No se pudo obtener la información del equipo');
        }
        const categoriesResponse = await fetch(apiUrl + '/categories');
        const categoriesData = await categoriesResponse.json();
        setCategories(['Todas', ...categoriesData.categories]);
      } catch (error) {
        setError('Ocurrió un error al intentar obtener la información inicial.');
      } finally {
        setLoading(false);
      }
    };
    fetchInitialData();
  }, [apiUrl, gameCode]);

  useEffect(() => {
    if (usedQuestions.length > 0) {
      fetchQuestions();
    }
  }, [usedQuestions]);

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`${apiUrl}/questions?page=${page}&category=${selectedCategory}&search=${searchTerm}`);
      const data = await response.json();
      const updatedQuestions = data.questions.map((question: Question) => ({
        ...question,
        used: usedQuestions.includes(question.pregunta),
      }));
      setFilteredQuestions(updatedQuestions);
      setCurrentPage(page);
      setTotalPages(data.totalPages);
      if (page > data.totalPages) {
        fetchQuestions(1);
      }
    } catch (error) {
      setError('Error al cargar las preguntas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions(currentPage)
  }, [searchTerm, selectedCategory, currentPage])

  const handleStartRound = (question: Question) => {
    if (!question.tema.trim()) {
      setError('El tema de la pregunta no puede estar vacío.');
      return;
    }
    if (!question.pregunta.trim()) {
      setError('La pregunta no puede estar vacía.');
      return;
    }
    if (!question.respuestas || question.respuestas.length === 0) {
      setError('La pregunta debe tener al menos una respuesta.');
      return;
    }
    for (const respuesta of question.respuestas) {
      if (!respuesta.respuesta.trim()) {
        setError('Todas las respuestas deben tener un texto.');
        return;
      }
      if (respuesta.pts < 0) {
        setError('Las puntuaciones deben ser mayores o iguales a 0.');
        return;
      }
    }
    setError('');
    const payload = {
      code: gameCode,
      pregunta: {
        pregunta: question.pregunta,
        respuestas: question.respuestas
      }
    };
    fetch(`${apiUrl}/gameAddQuestion`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          console.log('Pregunta agregada exitosamente:', data.message);
          handleStatus("game-init");
        } else {
          setError(data.message || 'Error al agregar la pregunta.');
          console.log(data.message || 'Error al agregar la pregunta.');
        }
      })
      .catch(error => {
        setError('Error al conectar con el servidor.');
        console.error('Error:', error);
      });
  };


  const handleSaveScore = () => {
    setTeams(teams.map((team, index) => ({
      ...team,
      score: editedScores[index]
    })));
    setIsEditingScore(false);
    handleSetScores();
  }

  const handleGenerateQuestionsAI = async () => {
    if (!topicInput) {
      setError('Por favor, ingrese un tema para generar preguntas.')
      return
    }
    try {
      setLoading(true)
      const response = await fetch(`${apiUrl}/generar-preguntas?tema=${topicInput}`)
      const data = await response.json()
      if (data.preguntas) {
        setGeneratedQuestions(data.preguntas)
      } else {
        setError('No se pudieron generar preguntas.')
      }
    } catch (error) {
      setError('Error al generar preguntas con IA: ' + error)
    } finally {
      setLoading(false)
    }
  }

  const handleSetScores = async () => {
    try {
      const response = await fetch(`${apiUrl}/setScores`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: gameCode,
          scoreFrist: editedScores[0],
          scoreSecond: editedScores[1]
        }),
      })
      if (!response.ok) {
        throw new Error('Error al actualizar las puntuaciones')
      }
      const data = await response.json()
      if (data.success) {
        console.log('Puntuaciones actualizadas exitosamente')
      } else {
        console.error('Error al actualizar las puntuaciones:', data.message)
      }
    } catch (error) {
      console.error('Error al enviar las puntuaciones:', error)
    }

  }


  return (
    <div className="min-h-screen bg-gradient-to-r from-purple-500 to-pink-500 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-lg p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6">Selección de Preguntas</h1>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 space-y-4 sm:space-y-0">
          <Card className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Trophy size={20} />
                  <span className="font-semibold">Puntajes</span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setIsEditingScore((prev) => !prev)}>
                  <Edit size={16} />
                </Button>
              </div>
              <div className="flex flex-wrap justify-between gap-2">
                {teams.map((team, index) => (
                  <div key={index} className="flex items-center space-x-2 bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <span className="text-2xl" role="img" aria-label={`Avatar del ${team.name}`}>
                      {team.avatar}
                    </span>
                    {isEditingScore ? (
                      <Input
                        type="number"
                        value={editedScores[index]}
                        onChange={(e) => {
                          const newScores = [...editedScores]
                          newScores[index] = parseInt(e.target.value) || 0
                          setEditedScores(newScores)
                        }}
                        className="w-16 h-6 text-black"
                      />
                    ) : (
                      <span className="font-medium">{team.score}</span>
                    )}
                  </div>
                ))}
              </div>
              {isEditingScore && (
                <Button size="sm" onClick={handleSaveScore} className="mt-2">
                  Guardar
                </Button>
              )}
            </CardContent>
          </Card>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <Search className="text-gray-400" />
            <Input
              type="text"
              placeholder="Buscar preguntas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-64"
            />
          </div>
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          {categories.map((category) => (
            <Badge
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </Badge>
          ))}
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-1/4">Categoría</TableHead>
                <TableHead className="w-1/2">Pregunta</TableHead>
                <TableHead className="w-1/4">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredQuestions.map((question) => (
                <TableRow key={question.id}>
                  <TableCell>{question.tema}</TableCell>
                  <TableCell>{question.pregunta}</TableCell>
                  <TableCell className="flex space-x-2">
                    <Button
                      onClick={() => handleStartRound(question)}
                      disabled={question.used}
                      className="w-full sm:w-auto"
                    >
                      {question.used ? 'Usada' : 'Iniciar Ronda'}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() => setViewResponses(question)}
                      className="w-full sm:w-auto"
                    >
                      <Eye className="mr-2 h-4 w-4" /> Ver Respuestas
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between items-center mt-4">
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            Anterior
          </Button>
          <span>
            Página {currentPage} de {totalPages}
          </span>
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0 mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Agregar Pregunta
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Agregar Nueva Pregunta</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select
                    onValueChange={(value) => setNewQuestion({ ...newQuestion, tema: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(category => category !== 'Todas').map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="question">Pregunta</Label>
                  <Textarea
                    id="question"
                    value={newQuestion.pregunta}
                    onChange={(e) => setNewQuestion({ ...newQuestion, pregunta: e.target.value })}
                    placeholder="Escribe la nueva pregunta aquí"
                  />
                </div>
                <div>
                  <Label>Respuestas</Label>
                  {newQuestion.respuestas?.map((answer, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        placeholder="Respuesta"
                        value={answer.respuesta}
                        onChange={(e) => {
                          const updatedRespuestas = [...newQuestion.respuestas!]
                          updatedRespuestas[index].respuesta = e.target.value
                          setNewQuestion({ ...newQuestion, respuestas: updatedRespuestas })
                        }}
                      />
                      <Input
                        type="number"
                        placeholder="Puntos"
                        value={answer.pts}
                        onChange={(e) => {
                          const updatedRespuestas = [...newQuestion.respuestas!]
                          updatedRespuestas[index].pts = parseInt(e.target.value) || 0
                          setNewQuestion({ ...newQuestion, respuestas: updatedRespuestas })
                        }}
                      />
                      <Button variant="ghost" onClick={() => {
                        const updatedRespuestas = newQuestion.respuestas!.filter((_, i) => i !== index)
                        setNewQuestion({ ...newQuestion, respuestas: updatedRespuestas })
                      }}>
                        Eliminar
                      </Button>
                    </div>
                  ))}
                  <Button
                    className="mt-4"
                    onClick={() => {
                      setNewQuestion({
                        ...newQuestion,
                        respuestas: [...newQuestion.respuestas!, { respuesta: '', pts: 0 }]
                      })
                    }}
                  >
                    Agregar Respuesta
                  </Button>
                </div>
                {error && (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  onClick={() => handleStartRound(newQuestion)}
                >
                  Iniciar Ronda
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>




          <Dialog>
            <DialogTrigger asChild>
              <Button variant="secondary">
                <Plus className="mr-2 h-4 w-4" /> Generar Preguntas IA
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[80vh] flex flex-col">
              <DialogHeader className="flex-shrink-0">
                <DialogTitle>Generar Preguntas con IA</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 overflow-y-auto flex-grow pr-4">
                <div>
                  <Label htmlFor="topic">Tema</Label>
                  <Input
                    id="topic"
                    value={topicInput}
                    onChange={(e) => setTopicInput(e.target.value)}
                    placeholder="Ingrese un tema para generar preguntas"
                  />
                </div>
                <Button onClick={handleGenerateQuestionsAI} disabled={loading} className="w-full">
                  {loading ? 'Generando...' : 'Generar Preguntas'}
                </Button>
                {error && (
                  <div className="flex items-center space-x-2 text-red-500">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                  </div>
                )}
                {generatedQuestions.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Preguntas Generadas:</h3>
                    <ul className="space-y-4">
                      {generatedQuestions.map((question, index) => (
                        <li key={index} className="border p-4 rounded-lg">
                          <p className="mb-2">{question.pregunta}</p>
                          <div className="space-y-2">
                            <Button
                              onClick={() => handleStartRound(question)}
                              disabled={question.used}
                              className="w-full"
                            >
                              {question.used ? 'Usada' : 'Iniciar Ronda'}
                            </Button>
                            <Button
                              variant="ghost"
                              onClick={() => setViewResponses(question)}
                              className="w-full"
                            >
                              <Eye className="mr-2 h-4 w-4" /> Ver Respuestas
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Dialog open={!!viewResponses} onOpenChange={() => setViewResponses(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Respuestas de la Pregunta</DialogTitle>
          </DialogHeader>
          {viewResponses && (
            <div className="space-y-4">
              <h2>{viewResponses.pregunta}</h2>
              {viewResponses.respuestas && viewResponses.respuestas.length > 0 ? (
                <ul>
                  {viewResponses.respuestas.map((response, index) => (
                    <li key={index}>
                      {response.respuesta}: {response.pts} pts
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No hay respuestas disponibles.</p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )

}
