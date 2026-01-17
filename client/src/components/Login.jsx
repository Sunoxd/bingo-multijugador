import React, { useState } from 'react';

const Login = ({ setRole, setPlayerName, setCardQuantity }) => {
  const [name, setName] = useState('');
  const [qty, setQty] = useState(1);

  const handlePlayerLogin = () => {
    if (!name.trim()) return alert("Escribe tu nombre");
    setPlayerName(name);
    setCardQuantity(qty);
    setRole('player');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-900 text-white p-4">
      <h1 className="text-5xl font-black mb-10 text-yellow-500 italic uppercase">Bingo Pro</h1>
      <div className="bg-slate-800 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-slate-700">
        <label className="block mb-2 font-bold text-gray-400">Nombre del Jugador</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)}
          className="w-full p-4 rounded-xl bg-slate-700 border border-slate-600 mb-6 outline-none focus:border-blue-500" placeholder="Ej: Miguel" />

        <label className="block mb-2 font-bold text-gray-400">¿Cuántos cartones quieres?</label>
        <div className="flex gap-4 mb-8">
          {[1, 2, 3].map(num => (
            <button key={num} onClick={() => setQty(num)} className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${qty === num ? 'bg-blue-600 border-blue-400 scale-105' : 'bg-slate-700 border-slate-600 text-gray-400'}`}>
              {num}
            </button>
          ))}
        </div>
        <button onClick={handlePlayerLogin} className="w-full bg-green-600 hover:bg-green-500 py-4 rounded-xl font-black text-xl shadow-lg transition-all">ENTRAR A JUGAR</button>
        <button onClick={() => setRole('admin')} className="w-full mt-6 text-slate-500 text-sm hover:underline">Acceso Admin</button>
      </div>
    </div>
  );
};

export default Login;