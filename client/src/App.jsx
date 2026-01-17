import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import PlayerBoard from './components/PlayerBoard';
import AdminPanel from './components/AdminPanel';

// REEMPLAZA ESTA IP por la de tu computadora para jugar en el móvil
const SERVER_URL = 'http://192.168.1.15:3001'; 
const socket = io(SERVER_URL);

function App() {
  const [role, setRole] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [cardQuantity, setCardQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-slate-900">
      {role === 'admin' ? (
        <AdminPanel socket={socket} />
      ) : role === 'player' ? (
        <PlayerBoard socket={socket} playerName={playerName} cardQuantity={cardQuantity} />
      ) : (
        <Login setRole={setRole} setPlayerName={setPlayerName} setCardQuantity={setCardQuantity} />
      )}
    </div>
  );
}

export default App;