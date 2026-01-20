import React, { useState, useEffect, useRef } from 'react';
import confetti from 'canvas-confetti';

const AdminPanel = ({ socket }) => {
  const [currentBall, setCurrentBall] = useState(null);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [winnerData, setWinnerData] = useState(null);
  const [isRolling, setIsRolling] = useState(false);
  
  // NUEVOS ESTADOS PARA AUTOMÁTICO
  const [isAuto, setIsAuto] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const timerRef = useRef(null);

  const bingoRows = [
    { letter: 'B', min: 1, max: 15, color: 'text-red-500', bg: 'bg-red-500/10 border-red-500/20' },
    { letter: 'I', min: 16, max: 30, color: 'text-yellow-500', bg: 'bg-yellow-500/10 border-yellow-500/20' },
    { letter: 'N', min: 31, max: 45, color: 'text-green-500', bg: 'bg-green-500/10 border-green-500/20' },
    { letter: 'G', min: 46, max: 60, color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20' },
    { letter: 'O', min: 61, max: 75, color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20' },
  ];

  const getWinningType = (matrix, drawn) => {
    const isM = (n) => n === 0 || drawn.includes(n);
    const winningCells = new Set();
    for (let r = 0; r < 5; r++) {
      if (matrix[r].every(isM)) matrix[r].forEach((_, c) => winningCells.add(`${r}-${c}`));
    }
    for (let c = 0; c < 5; c++) {
      if ([0,1,2,3,4].every(r => isM(matrix[r][c]))) [0,1,2,3,4].forEach(r => winningCells.add(`${r}-${c}`));
    }
    if ([0,1,2,3,4].every(i => isM(matrix[i][i]))) [0,1,2,3,4].forEach(i => winningCells.add(`${i}-${i}`));
    if ([0,1,2,3,4].every(i => isM(matrix[i][4-i]))) [0,1,2,3,4].forEach(i => winningCells.add(`${i}-${4-i}`));
    return winningCells;
  };

  const handleDrawBall = () => {
    if (isRolling || winnerData || drawnNumbers.length >= 75) return;
    setIsRolling(true);
    let count = 0;
    const shuffle = setInterval(() => {
      setCurrentBall(Math.floor(Math.random() * 75) + 1);
      count++;
      if (count > 10) {
        clearInterval(shuffle);
        setIsRolling(false);
        socket.emit('admin_draw_ball');
        setCountdown(5); // Reiniciar cuenta regresiva tras sacar bola
      }
    }, 60);
  };

  // Lógica del modo automático
  useEffect(() => {
    if (isAuto && !winnerData && drawnNumbers.length < 75) {
      timerRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            handleDrawBall();
            return 5;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [isAuto, winnerData, drawnNumbers.length]);

  useEffect(() => {
    if (!socket) return;
    socket.on('ball_drawn', (num) => {
      setCurrentBall(num);
      setDrawnNumbers((prev) => prev.includes(num) ? prev : [...prev, num]);
    });
    socket.on('game_over', (data) => {
      setWinnerData(data);
      setIsAuto(false); // Detener automático si hay ganador
      confetti({ particleCount: 200, spread: 80, origin: { y: 0.6 } });
    });
    socket.on('game_reset', () => {
      setCurrentBall(null);
      setDrawnNumbers([]);
      setWinnerData(null);
      setIsRolling(false);
      setIsAuto(false);
    });
    return () => socket.off();
  }, [socket]);

  const winningCells = winnerData ? getWinningType(winnerData.winningMatrix, drawnNumbers) : new Set();

  return (
    <div className="h-screen w-full bg-slate-950 text-white p-2 flex flex-col items-center overflow-hidden font-sans">
      
      {/* SECCIÓN SUPERIOR: RULETA Y BOTONES */}
      <div className="w-full max-w-6xl flex items-center justify-between gap-4 h-[38%] px-4">
        
        {/* Lado Izquierdo: Estado Auto */}
        <div className="flex flex-col gap-2 w-44">
           <div className={`p-4 rounded-2xl border transition-all ${isAuto ? 'bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]' : 'bg-slate-900 border-slate-800'}`}>
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1 text-center">Modo Automático</p>
              <div className="flex items-center justify-between">
                 <span className={`text-xs font-bold ${isAuto ? 'text-green-400' : 'text-slate-600'}`}>{isAuto ? 'ON' : 'OFF'}</span>
                 <button 
                  onClick={() => setIsAuto(!isAuto)}
                  className={`w-12 h-6 rounded-full relative transition-colors ${isAuto ? 'bg-green-600' : 'bg-slate-700'}`}
                 >
                   <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isAuto ? 'left-7' : 'left-1'}`}></div>
                 </button>
              </div>
              {isAuto && !isRolling && (
                <div className="mt-2 text-center animate-pulse">
                   <span className="text-2xl font-black text-green-400">0:0{countdown}</span>
                </div>
              )}
           </div>
           <div className="bg-slate-900/50 py-2 px-4 rounded-xl border border-slate-800 flex justify-between items-center">
              <span className="text-[10px] text-slate-500">BOLAS:</span>
              <span className="text-xl font-black text-blue-500">{drawnNumbers.length}/75</span>
           </div>
        </div>

        {/* Ruleta Central */}
        <div className={`
          relative w-44 h-44 md:w-52 md:h-52 rounded-full flex flex-col items-center justify-center
          bg-gradient-to-br from-white to-slate-300 text-slate-950
          shadow-[0_0_50px_rgba(59,130,246,0.2)] border-[10px] border-slate-950
          transition-all duration-200 ${isRolling ? 'scale-95 brightness-110' : 'scale-100'}
        `}>
          <span className="text-8xl md:text-9xl font-black leading-none">{currentBall || '--'}</span>
          <span className="text-2xl font-bold text-blue-700 absolute bottom-4 uppercase">
            {currentBall ? (currentBall <= 15 ? 'B' : currentBall <= 30 ? 'I' : currentBall <= 45 ? 'N' : currentBall <= 60 ? 'G' : 'O') : ''}
          </span>
        </div>

        {/* Lado Derecho: Controles Manuales */}
        <div className="flex flex-col gap-3 w-56">
          <button 
            onClick={handleDrawBall}
            disabled={isRolling || winnerData || drawnNumbers.length >= 75 || isAuto}
            className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-2xl font-black text-2xl shadow-[0_5px_0_rgb(29,78,216)] active:shadow-none active:translate-y-[5px] transition-all disabled:opacity-20"
          >
            {isRolling ? 'GIRANDO...' : 'SACAR BOLA'}
          </button>
          <button 
            onClick={() => window.confirm('¿Reiniciar partida?') && socket.emit('admin_reset_game')}
            className="py-2 text-[10px] bg-slate-950 hover:text-red-400 rounded-xl font-bold text-slate-600 border border-slate-800 transition-all uppercase tracking-widest"
          >
            Reiniciar Todo
          </button>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: TABLERO */}
      <div className="w-full max-w-6xl h-[58%] bg-slate-900/40 rounded-[2.5rem] border border-slate-800/50 p-4 flex flex-col justify-between mb-4 shadow-2xl backdrop-blur-sm">
        <div className="flex flex-col h-full gap-2">
          {bingoRows.map((row) => (
            <div key={row.letter} className={`flex-1 flex items-center gap-3 p-1.5 rounded-2xl border ${row.bg}`}>
              <div className={`w-12 h-full flex items-center justify-center text-3xl font-black ${row.color} bg-slate-950 rounded-xl shadow-inner`}>
                {row.letter}
              </div>
              <div className="flex-1 grid grid-cols-15 h-full gap-1.5">
                {Array.from({ length: 15 }, (_, i) => row.min + i).map((num) => {
                  const isMarked = drawnNumbers.includes(num);
                  const isCurrent = currentBall === num;
                  return (
                    <div key={num} className={`flex items-center justify-center text-sm md:text-lg font-black rounded-lg transition-all duration-500 border h-full ${isCurrent ? 'bg-yellow-400 text-black border-yellow-100 scale-110 z-10 animate-pulse' : isMarked ? 'bg-red-600 text-white border-red-400' : 'bg-slate-950/40 text-slate-700 border-slate-800/20'}`}>
                      {num}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL GANADOR */}
      {winnerData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-in fade-in duration-500">
          <div className="bg-slate-900 border-2 border-yellow-500 rounded-[3rem] p-8 max-w-md w-full text-center shadow-[0_0_100px_rgba(234,179,8,0.2)]">
            <h2 className="text-5xl font-black text-yellow-500 mb-4 tracking-tighter italic">¡BINGO!</h2>
            <div className="bg-slate-950 py-4 rounded-2xl border border-slate-800 mb-6 shadow-inner">
              <p className="text-3xl font-black text-white px-4 truncate uppercase tracking-tight">{winnerData.winner}</p>
              <div className="mt-2 inline-block px-4 py-1 bg-yellow-500 text-black rounded-full font-black text-xs uppercase tracking-widest">Cartón #{winnerData.cardNumber}</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 mb-6 inline-block">
              <div className="grid grid-cols-5 gap-1.5">
                {winnerData.winningMatrix.map((row, rIdx) => 
                  row.map((num, cIdx) => {
                    const isWin = winningCells.has(`${rIdx}-${cIdx}`);
                    const isDrawn = drawnNumbers.includes(num) || num === 0;
                    return (
                      <div key={`${rIdx}-${cIdx}`} className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-black border ${isWin ? 'bg-green-500 text-white border-green-300 scale-105 shadow-lg z-10 animate-bounce' : isDrawn ? 'bg-red-600 text-white border-red-400' : 'bg-slate-900 text-slate-600 border-slate-800'}`}>
                        {num === 0 ? '★' : num}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
            <button onClick={() => socket.emit('admin_reset_game')} className="w-full py-5 bg-green-600 hover:bg-green-500 rounded-2xl font-black text-xl shadow-xl transition-all">NUEVA PARTIDA</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;