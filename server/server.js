import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import Card from './models/Card.js';
import { checkBingo } from './utils/bingoUtils.js';

dotenv.config();
const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

// Conexión a MongoDB Atlas
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bingo-db';
mongoose.connect(mongoURI)
  .then(() => console.log('🚀 Conectado a MongoDB Atlas'))
  .catch(err => console.error('❌ Error de conexión:', err));

let gameState = { drawnNumbers: [], isGameOver: false, winner: null, winnerCardIndex: null };

io.on('connection', (socket) => {
    socket.on('join_game', async ({ playerName, quantity = 1 }) => {
        const cardsToSend = [];
        for (let i = 0; i < quantity; i++) {
            const card = await Card.findOneAndUpdate({ isAssigned: false }, { isAssigned: true });
            if (card) {
                const allCards = await Card.find().select('_id');
                const cardIndex = allCards.findIndex(c => c._id.equals(card._id)) + 1;
                cardsToSend.push({ id: card._id, matrix: card.matrix, cardNumber: cardIndex });
            }
        }
        if (cardsToSend.length > 0) {
            socket.emit('cards_assigned', cardsToSend);
            socket.emit('game_state', gameState);
        }
    });

    socket.on('admin_draw_ball', () => {
        if (gameState.isGameOver || gameState.drawnNumbers.length >= 75) return;
        let ball;
        do { ball = Math.floor(Math.random() * 75) + 1; } 
        while (gameState.drawnNumbers.includes(ball));
        gameState.drawnNumbers.push(ball);
        io.emit('ball_drawn', ball);
    });

    socket.on('admin_reset_game', async () => {
        gameState = { drawnNumbers: [], isGameOver: false, winner: null, winnerCardIndex: null };
        await Card.updateMany({}, { isAssigned: false });
        io.emit('game_reset');
    });

    socket.on('check_bingo', async ({ cardId, playerName, cardNumber }) => {
        const card = await Card.findById(cardId);
        if (card && checkBingo(card.matrix, gameState.drawnNumbers)) {
            gameState.isGameOver = true;
            gameState.winner = playerName;
            gameState.winnerCardIndex = cardNumber;
            io.emit('game_over', { 
                winner: playerName, 
                cardNumber: cardNumber,
                winningMatrix: card.matrix 
            });
        }
    });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, '0.0.0.0', () => console.log(`🔥 Servidor en puerto ${PORT}`));