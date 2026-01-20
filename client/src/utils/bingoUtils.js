// client/src/utils/bingoUtils.js
export const checkBingo = (cardMatrix, drawnNumbers) => {
  const isMarked = (num) => num === 0 || drawnNumbers.includes(num);

  // Check rows
  for (let r = 0; r < 5; r++) {
    if (cardMatrix[r].every(isMarked)) return true;
  }

  // Check columns
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every(r => isMarked(cardMatrix[r][c]))) return true;
  }

  // Check main diagonal (top-left to bottom-right)
  if ([0, 1, 2, 3, 4].every(i => isMarked(cardMatrix[i][i]))) return true;

  // Check anti-diagonal (top-right to bottom-left)
  if ([0, 1, 2, 3, 4].every(i => isMarked(cardMatrix[i][4 - i]))) return true;

  return false;
};