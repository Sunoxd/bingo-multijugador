import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Card from './models/Card.js';

dotenv.config();

const generateBingoCard = () => {
  const card = Array.from({ length: 5 }, () => Array(5).fill(0));
  const columns = {
    0: [1, 15], 1: [16, 30], 2: [31, 45], 3: [46, 60], 4: [61, 75]
  };

  for (let c = 0; c < 5; c++) {
    const [min, max] = columns[c];
    const nums = new Set();
    while (nums.size < 5) {
      nums.add(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    const sortedNums = Array.from(nums);
    for (let r = 0; r < 5; r++) {
      card[r][c] = sortedNums[r];
    }
  }
  card[2][2] = 0; // Espacio libre
  return card;
};

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Card.deleteMany({}); // Limpia la base de datos anterior
    
    const cards = [];
    for (let i = 0; i < 200; i++) {
      cards.push({ matrix: generateBingoCard(), isAssigned: false });
    }
    
    await Card.insertMany(cards);
    console.log("🎉 ¡200 cartones subidos con éxito a MongoDB Atlas!");
    process.exit();
  } catch (err) {
    console.error("❌ Error al subir cartones:", err);
    process.exit(1);
  }
};

seedDB();