import mongoose from 'mongoose';
import Card from './models/Card.js';

const generateBingoCard = () => {
  const card = Array.from({ length: 5 }, () => Array(5).fill(0));
  const columns = { 0: [1, 15], 1: [16, 30], 2: [31, 45], 3: [46, 60], 4: [61, 75] };
  for (let c = 0; c < 5; c++) {
    const [min, max] = columns[c];
    const nums = new Set();
    while (nums.size < 5) { nums.add(Math.floor(Math.random() * (max - min + 1)) + min); }
    const sortedNums = Array.from(nums);
    for (let r = 0; r < 5; r++) { card[r][c] = sortedNums[r]; }
  }
  card[2][2] = 0;
  return card;
};

const seedDB = async () => {
  try {
    const count = await Card.countDocuments();
    if (count > 0) return console.log("✅ La DB ya tiene cartones.");
    
    console.log("🎲 Generando 200 cartones iniciales...");
    const cards = [];
    for (let i = 0; i < 200; i++) {
      cards.push({ matrix: generateBingoCard(), isAssigned: false });
    }
    await Card.insertMany(cards);
    console.log("🎉 ¡200 cartones creados exitosamente!");
  } catch (err) {
    console.error("❌ Error en seed:", err);
  }
};

export default seedDB;