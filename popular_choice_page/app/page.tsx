
"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { HomePage } from "@/components/home-page";
import { TableroPage } from "@/components/tablero/tablero-page";
import { ControlPage } from "@/components/control/control-page";
import { useApi } from '@/hooks/useApi';

export default function Page() {
  const [gameCode, setGameCode] = useState('');
  const [mode, setMode] = useState<'null' | 'tablero' | 'control'>('null');
  const { apiUrl } = useApi()
  const [socket, setSocket] = useState<Socket>(io(apiUrl));

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const urlMode = queryParams.get('mode');
    const urlGameCode = queryParams.get('code');

    const savedMode = urlMode || localStorage.getItem('mode');
    const savedGameCode = urlGameCode || localStorage.getItem('gameCode');

    if (savedMode) setMode(savedMode as 'null' | 'tablero' | 'control');
    if (savedMode && savedGameCode) setGameCode(savedGameCode);

    if (savedMode != 'control') {
      const newSocket = io(apiUrl);
      setSocket(newSocket);

      if (savedMode === 'tablero') {
        newSocket.emit('joinGame', { code: savedGameCode });
        newSocket.on('joinedBoard', (data) => {
          console.log("Board joined:", data);
        });
      } else {
        newSocket.emit('generateGameCode');
        newSocket.on('gameCodeGenerated', (data) => {
          console.log("Game generated:", data);
          setGameCode(data.code);
        });

        newSocket.on('gameConnected', (data) => {
          console.log("Game connected:", data);
          handleModeSelect(data.code, 'tablero');
        });
      }

      return () => {
        newSocket.disconnect();
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
      {mode === 'tablero' && <TableroPage gameCode={gameCode} socketio={socket} />}
      {mode === 'control' && <ControlPage gameCode={gameCode} />}
    </>
  );
}
