
"use client";

import { useEffect, useState } from 'react';
import io from 'socket.io-client';
import { HomePage } from "@/components/home-page";
import { TableroPage } from "@/components/tablero/tablero-page";
import { ControlPage } from "@/components/control/control-page";
import { useApi } from '@/hooks/useApi';

export default function Page() {
  const [gameCode, setGameCode] = useState('');
  const [mode, setMode] = useState<'null' | 'tablero' | 'control'>('null');
  const { apiUrl } = useApi()

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlMode = queryParams.get('mode');
    const urlGameCode = queryParams.get('code');

    const savedMode = urlMode || localStorage.getItem('mode');
    const savedGameCode = urlGameCode || localStorage.getItem('gameCode');

    if (savedMode) setMode(savedMode as 'null' | 'tablero' | 'control');
    if (savedMode && savedGameCode) setGameCode(savedGameCode);

    console.log("Current Mode:", mode);
    console.log("Saved Mode:", savedMode);
    console.log("Current GameCode:", gameCode);
    console.log("Saved GameCode:", savedGameCode);

    if (savedMode != 'control') {
      const socket = io(apiUrl);

      if (savedMode === 'tablero') {
        socket.emit('joinGame', { code: savedGameCode });
        socket.on('joinedBoard', (data) => {
          console.log("Board joined:", data);
        });
      } else {
        socket.emit('generateGameCode');
        socket.on('gameCodeGenerated', (data) => {
          setGameCode(data.code);
        });

        socket.on('gameConnected', (data) => {
          setMode('tablero');
        });
      }

      return () => {
        socket.disconnect();
      };
    }
  }, []);

  const handleModeSelect = (newCode: string, newMode: 'tablero' | 'control') => {
    setGameCode(newCode);
    setMode(newMode);
    localStorage.setItem('gameCode', newCode);
    localStorage.setItem('mode', newMode);
  };

  return (
    <>
      {mode === 'null' && <HomePage gameCode={gameCode} onModeSelect={handleModeSelect} />}
      {mode === 'tablero' && <TableroPage gameCode={gameCode} />}
      {mode === 'control' && <ControlPage gameCode={gameCode} />}
    </>
  );
}
