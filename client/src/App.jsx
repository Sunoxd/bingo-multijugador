import React, { useState } from 'react';
import io from 'socket.io-client';
import Login from './components/Login';
import PlayerBoard from './components/PlayerBoard';
import AdminPanel from './components/AdminPanel';

// USA TU URL DE RENDER AQUÍ
const socket = io('https://bingo-multijugador-u5lv.onrender.com');

function App() {
  const [role, setRole] = useState(null);
  const [playerName, setPlayerName] = useState('');
  const [cardQuantity, setCardQuantity] = useState(1);

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {!role && <Login setRole={setRole} setPlayerName={setPlayerName} setCardQuantity={setCardQuantity} />}
      {role === 'admin' && <AdminPanel socket={socket} />}
      {role === 'player' && <PlayerBoard socket={socket} playerName={playerName} cardQuantity={cardQuantity} />}
    </div>
  );
}
export default App;