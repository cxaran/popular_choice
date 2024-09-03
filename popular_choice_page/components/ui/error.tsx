"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, RefreshCw, RotateCcw } from 'lucide-react'

export default function ErrorScreen({ error }: { error: string | null }) {
    const router = useRouter()

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    const handleReload = () => {
        window.location.reload()
    }

    const handleReset = () => {
        localStorage.clear()
        sessionStorage.clear()
        window.location.reload()
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-red-500 to-pink-500 flex items-center justify-center p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="flex items-center justify-center text-2xl font-bold text-red-600">
                        <AlertCircle className="w-8 h-8 mr-2" />
                        Error Inesperado
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-center text-gray-600 mb-4">
                        Lo sentimos, ha ocurrido un error inesperado. Por favor, intenta recargar la página.
                    </p>
                    {error && (
                        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
                            <p className="font-bold">Mensaje de error:</p>
                            <p>{error}</p>
                        </div>
                    )}
                </CardContent>
                <CardFooter className="flex justify-center space-x-4">
                    <Button
                        onClick={handleReload}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        <RefreshCw className="mr-2 h-4 w-4" /> Recargar Página
                    </Button>
                    <Button
                        onClick={handleReset}
                        className="bg-red-500 hover:bg-red-600 text-white"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" /> Reiniciar Partida
                    </Button>
                </CardFooter>
            </Card>
        </div>
    )
}