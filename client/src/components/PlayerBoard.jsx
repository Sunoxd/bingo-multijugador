import React, { useState, useEffect } from 'react';

const PlayerBoard = ({ socket, playerName, cardQuantity }) => {
  const [cards, setCards] = useState([]);
  const [drawnNumbers, setDrawnNumbers] = useState([]);
  const [winnerInfo, setWinnerInfo] = useState(null);

  useEffect(() => {
    socket.emit('join_game', { playerName, quantity: cardQuantity });
    socket.on('cards_assigned', (data) => setCards(data));
    socket.on('ball_drawn', (num) => setDrawnNumbers(prev => [...prev, num]));
    socket.on('game_state', (state) => setDrawnNumbers(state.drawnNumbers));
    socket.on('game_reset', () => { 
      setCards([]); setDrawnNumbers([]); setWinnerInfo(null); 
      socket.emit('join_game', { playerName, quantity: cardQuantity }); 
    });
    socket.on('game_over', (data) => setWinnerInfo(data));
    return () => socket.off();
  }, [socket, playerName, cardQuantity]);

  if (cards.length === 0) return (
    <div className="h-screen flex items-center justify-center text-white animate-pulse text-xl font-bold">
      GENERANDO TUS {cardQuantity} CARTONES...
    </div>
  );

  return (
    <div className="p-4 flex flex-col items-center">
      {winnerInfo && (
        <div className="fixed top-0 left-0 w-full bg-yellow-500 text-black p-3 text-center font-black z-50 shadow-2xl border-b-2 border-black">
          🏆 ¡BINGO! GANADOR: {winnerInfo.winner.toUpperCase()} (# {winnerInfo.cardNumber}) 🏆
        </div>
      )}
      
      <div className="w-full max-w-6xl mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map(card => (
          <div key={card.id} className="bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 relative shadow-xl">
            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 border-slate-900">
              #{card.cardNumber}
            </div>
            <div className="grid grid-cols-5 gap-1 mb-4">
              {['B','I','N','G','O'].map(l => <div key={l} className="text-center font-black text-yellow-500">{l}</div>)}
              {card.matrix.map((row, i) => row.map((num, j) => {
                const isMarked = drawnNumbers.includes(num) || num === 0;
                return (
                  <div key={`${i}-${j}`} className={`aspect-square flex items-center justify-center rounded-lg font-bold text-sm transition-all ${isMarked ? 'bg-green-600 text-white shadow-inner scale-105' : 'bg-slate-700 text-slate-400'}`}>
                    {num === 0 ? '★' : num}
                  </div>
                )
              }))}
            </div>
            <button 
              onClick={() => socket.emit('check_bingo', { cardId: card.id, playerName, cardNumber: card.cardNumber })}
              className="w-full bg-red-600 py-3 rounded-xl font-black text-white hover:bg-red-500 transition-all active:scale-95"
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