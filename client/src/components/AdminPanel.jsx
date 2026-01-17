import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';

const AdminPanel = ({ socket }) => {
  const [currentBall, setCurrentBall] = useState('--');
  const [history, setHistory] = useState([]);
  const [winnerData, setWinnerData] = useState(null);
  const [isRolling, setIsRolling] = useState(false);

  useEffect(() => {
    socket.on('ball_drawn', (num) => { setCurrentBall(num); setHistory(prev => [num, ...prev]); });
    socket.on('game_over', (data) => { 
      setWinnerData(data); 
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    });
    socket.on('game_reset', () => { setCurrentBall('--'); setHistory([]); setWinnerData(null); setIsRolling(false); });
    return () => socket.off();
  }, [socket]);

  const handleDrawBall = () => {
    if (isRolling || winnerData) return;
    setIsRolling(true);
    let count = 0;
    const shuffle = setInterval(() => {
      setCurrentBall(Math.floor(Math.random() * 75) + 1);
      count++;
      if (count > 25) {
        clearInterval(shuffle);
        setIsRolling(false);
        socket.emit('admin_draw_ball');
      }
    }, 100);
  };

  const isWinningNum = (num) => winnerData?.winningMatrix.some(row => row.includes(num));

  return (
    <div className="p-6 flex flex-col items-center text-white">
      {winnerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
          <div className="bg-slate-800 border-4 border-yellow-500 rounded-3xl p-6 max-w-sm w-full shadow-[0_0_50px_rgba(234,179,8,0.4)]">
            <h2 className="text-3xl font-black text-center text-yellow-500 mb-4 animate-pulse">¡BINGO!</h2>
            <p className="text-center mb-4"><b>{winnerData.winner}</b> ganó con el cartón <b>#{winnerData.cardNumber}</b></p>
            <div className="grid grid-cols-5 gap-1 bg-slate-900 p-2 rounded-xl mb-6">
              {winnerData.winningMatrix.map((row, i) => row.map((num, j) => (
                <div key={`${i}-${j}`} className={`h-10 flex items-center justify-center rounded-full text-[10px] font-bold ${history.includes(num) || num === 0 ? 'bg-yellow-500 text-black shadow-[0_0_10px_white]' : 'bg-slate-700 text-slate-500'}`}>
                  {num === 0 ? '★' : num}
                </div>
              )))}
            </div>
            <button onClick={() => socket.emit('admin_reset_game')} className="w-full py-3 bg-green-600 rounded-xl font-bold shadow-lg">NUEVO JUEGO</button>
            <button onClick={() => setWinnerData(null)} className="w-full mt-2 py-2 text-slate-400 text-sm">Cerrar visor</button>
          </div>
        </div>
      )}

      <h1 className="text-2xl font-black tracking-widest text-blue-500 mb-8">ADMINISTRADOR</h1>
      
      <div className={`w-48 h-48 rounded-full border-[10px] border-slate-800 flex items-center justify-center bg-slate-800 shadow-2xl mb-10 transition-all ${isRolling ? 'border-blue-500 scale-110 rotate-[360deg] duration-1000' : ''}`}>
        <span className="text-7xl font-black italic">{currentBall}</span>
      </div>

      <div className="flex gap-4 mb-12">
        <button onClick={handleDrawBall} disabled={isRolling || winnerData} className="bg-blue-600 px-10 py-4 rounded-2xl font-black text-xl shadow-[0_5px_0_rgb(29,78,216)] active:translate-y-1 active:shadow-none transition-all disabled:opacity-50">
          {isRolling ? 'SORTEANDO...' : 'SACAR NÚMERO'}
        </button>
        <button onClick={() => socket.emit('admin_reset_game')} className="bg-slate-700 px-6 py-4 rounded-2xl font-bold border border-slate-600">RESET</button>
      </div>

      <div className="w-full max-w-3xl bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700">
        <p className="text-center text-slate-500 font-bold text-xs uppercase mb-6 tracking-widest">Historial de Balotas</p>
        <div className="flex flex-wrap justify-center gap-3">
          {history.map((n, i) => (
            <div key={i} className={`relative w-12 h-12 rounded-full flex items-center justify-center text-lg font-black shadow-lg transition-all ${isWinningNum(n) ? 'bg-gradient-to-br from-green-400 to-green-700 text-white scale-110 border-2 border-white' : 'bg-gradient-to-br from-white to-slate-300 text-slate-800'}`}>
              <div className="absolute top-1 left-2 w-3 h-1 bg-white/40 rounded-full rotate-[-20deg]"></div>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;