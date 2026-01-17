import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
    matrix: [[Number]],
    isAssigned: { type: Boolean, default: false }
});

// Esta es la línea clave que faltaba: "export default"
const Card = mongoose.model('Card', cardSchema);
export default Card;