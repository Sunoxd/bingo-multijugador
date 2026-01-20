import React, { useState, useEffect } from 'react';

const PlayerBoard = ({ socket, playerName, cardQuantity }) => {
  const [cards, setCards] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [winnerInfo, setWinnerInfo] = useState(null);
  
  // Estados para la animación de la bola
  const [currentBall, setCurrentBall] = useState(null);
  const [isNewBall, setIsNewBall] = useState(false);

  useEffect(() => {
    socket.emit('join_game', { playerName, quantity: cardQuantity });
    
    socket.on('cards_assigned', (data) => setCards(data));
    
    socket.on('ball_drawn', (num) => {
      setCurrentBall(num);
      setIsNewBall(true);
      setDrawnNumbers(prev => [...prev, num]);
      // Quitar animación después de 2.5 segundos
      setTimeout(() => setIsNewBall(false), 2500);
    });

    socket.on('game_state', (state) => {
      setDrawnNumbers(state.drawnNumbers);
      if (state.drawnNumbers.length > 0) {
        setCurrentBall(state.drawnNumbers[state.drawnNumbers.length - 1]);
      }
    });

    socket.on('game_reset', () => { 
      setCards([]); 
      setDrawnNumbers([]); 
      setWinnerInfo(null); 
      setCurrentBall(null);
      socket.emit('join_game', { playerName, quantity: cardQuantity }); 
    });

    socket.on('game_over', (data) => setWinnerInfo(data));

    return () => socket.off();
  }, [socket, playerName, cardQuantity]);

  // Función para obtener la letra del Bingo
  const getBallLetter = (num) => {
    if (!num) return { l: '', c: 'text-white' };
    if (num <= 15) return { l: 'B', c: 'text-red-500' };
    if (num <= 30) return { l: 'I', c: 'text-yellow-500' };
    if (num <= 45) return { l: 'N', c: 'text-green-500' };
    if (num <= 60) return { l: 'G', c: 'text-blue-500' };
    return { l: 'O', c: 'text-purple-500' };
  };

  const ballInfo = getBallLetter(currentBall);

  if (cards.length === 0) return (
    <div className="h-screen flex items-center justify-center text-white animate-pulse text-xl font-bold">
      GENERANDO TUS {cardQuantity} CARTONES...
    </div>
  );

  return (
    <div className="p-4 flex flex-col items-center bg-slate-950 min-h-screen">
      
      {/* BANNER DE GANADOR */}
      {winnerInfo && (
        <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black p-3 text-center font-black z-50 shadow-2xl border-b-2 border-black">
          🏆 ¡BINGO! GANADOR: {winnerInfo.winner.toUpperCase()} (# {winnerInfo.cardNumber}) 🏆
        </div>
      )}

      {/* --- NUEVO VISUALIZADOR DE BOLA ANIMADA --- */}
      <div className={`mt-14 mb-8 transition-all duration-500 transform ${isNewBall ? 'scale-110' : 'scale-100'}`}>
        {currentBall ? (
          <div className="bg-slate-900 border-2 border-slate-700 rounded-3xl px-8 py-4 flex items-center gap-6 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center">
              <span className={`text-xl font-black ${ballInfo.c}`}>{ballInfo.l}</span>
              <span className="text-6xl font-black text-white leading-none">{currentBall}</span>
            </div>
            <div className="w-1 h-12 bg-slate-700 rounded-full"></div>
            <div className="text-slate-500 font-bold text-xs uppercase tracking-tighter">
              Última<br/>Bola
            </div>
          </div>
        ) : (
          <div className="text-slate-600 font-bold animate-pulse uppercase tracking-widest text-sm">
            Esperando primera bola...
          </div>
        )}
      </div>
      
      {/* GRILLA DE CARTONES */}
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {cards.map(card => (
          <div key={card.id} className="bg-slate-800 p-4 rounded-3xl border-2 border-slate-700 relative shadow-2xl">
            {/* Número de cartón flotante */}
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-10 h-10 rounded-full flex items-center justify-center font-black text-xs border-4 border-slate-900 shadow-lg">
              #{card.cardNumber}
            </div>

            <div className="grid grid-cols-5 gap-1.5 mb-5">
              {['B','I','N','G','O'].map(l => (
                <div key={l} className="text-center font-black text-yellow-500 text-xl mb-2">{l}</div>
              ))}
              
              {card.matrix.map((row, i) => row.map((num, j) => {
                const isMarked = drawnNumbers.includes(num) || num === 0;
                const isCenter = i === 2 && j === 2; // El espacio del centro

                return (
                  <div 
                    key={`${i}-${j}`} 
                    className={`aspect-square flex items-center justify-center rounded-xl font-bold text-lg transition-all duration-300 border-2
                    ${isMarked 
                      ? 'bg-green-600 border-green-400 text-white shadow-[inner_0_2px_4px_rgba(0,0,0,0.3)] scale-100' 
                      : 'bg-slate-700 border-slate-600 text-slate-400'}`}
                  >
                    {isCenter ? (
                      /* IMAGEN DEL LOGO EN EL CENTRO */
                      <div className="w-full h-full p-1 flex items-center justify-center overflow-hidden">
                        <img 
                          src="https://via.placeholder.com/60" // CAMBIA ESTO POR TU LOGO
                          alt="logo" 
                          className={`w-full h-full object-contain ${isMarked ? 'brightness-125' : 'opacity-40 grayscale'}`}
                        />
                      </div>
                    ) : (
                      num
                    )}
                  </div>
                )
              }))}
            </div>

            <button 
              onClick={() => socket.emit('check_bingo', { cardId: card.id, playerName, cardNumber: card.cardNumber })}
              className="w-full bg-red-600 py-4 rounded-2xl font-black text-white hover:bg-red-500 shadow-[0_4px_0_rgb(153,27,27)] active:shadow-none active:translate-y-1 transition-all text-lg"
            >
              ¡CANTAR BINGO!
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlayerBoard;