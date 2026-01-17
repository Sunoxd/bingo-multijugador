export const checkBingo = (matrix, drawnNumbers) => {
    // Verificar filas
    for (let row of matrix) {
        if (row.every(num => drawnNumbers.includes(num) || num === 0)) return true;
    }
    // Verificar columnas
    for (let col = 0; col < 5; col++) {
        let column = matrix.map(row => row[col]);
        if (column.every(num => drawnNumbers.includes(num) || num === 0)) return true;
    }
    // Diagonales
    const diag1 = [matrix[0][0], matrix[1][1], matrix[2][2], matrix[3][3], matrix[4][4]];
    const diag2 = [matrix[0][4], matrix[1][3], matrix[2][2], matrix[3][1], matrix[4][0]];
    
    if (diag1.every(num => drawnNumbers.includes(num) || num === 0)) return true;
    if (diag2.every(num => drawnNumbers.includes(num) || num === 0)) return true;

    return false;
};