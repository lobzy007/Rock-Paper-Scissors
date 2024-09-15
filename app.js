const crypto = require('crypto');
const moves = process.argv.slice(2);

if (moves.length < 3 || moves.length % 2 === 0) {
  console.log("Error: The number of moves must be an odd number >= 3.");
  console.log("Usage example: node game.js rock paper scissors");
  process.exit(1);
}

const uniqueMoves = new Set(moves);
if (uniqueMoves.size !== moves.length) {
  console.log("Error: Moves must be unique.");
  process.exit(1);
}

const key = crypto.randomBytes(32).toString('hex');
const computerMove = moves[Math.floor(Math.random() * moves.length)];
const hmac = crypto.createHmac('sha256', key).update(computerMove).digest('hex');

console.log("HMAC:", hmac);

const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log("Available moves:");
moves.forEach((move, index) => {
  console.log(`${index + 1} - ${move}`);
});
console.log("0 - exit");
console.log("? - help");

readline.question("Enter your move: ", (input) => {
  if (input === '0') {
    console.log("Game exited.");
    readline.close();
    return;
  }

  if (input === '?') {
    showHelpTable(moves);
    readline.close();
    return;
  }

  const playerMoveIndex = parseInt(input) - 1;
  if (isNaN(playerMoveIndex) || playerMoveIndex < 0 || playerMoveIndex >= moves.length) {
    console.log("Invalid move.");
    readline.close();
    return;
  }

  const playerMove = moves[playerMoveIndex];
  console.log("Your move:", playerMove);
  console.log("Computer move:", computerMove);

  const result = getGameResult(playerMoveIndex, moves.indexOf(computerMove), moves.length);
  console.log(result);

  console.log("HMAC key:", key);
  readline.close();
});

function getGameResult(playerMoveIndex, computerMoveIndex, totalMoves) {
  if (playerMoveIndex === computerMoveIndex) {
    return "Draw!";
  }

  const half = Math.floor(totalMoves / 2);

  if (
    (playerMoveIndex > computerMoveIndex && playerMoveIndex - computerMoveIndex <= half) ||
    (playerMoveIndex < computerMoveIndex && computerMoveIndex - playerMoveIndex > half)
  ) {
    return "You win!";
  } else {
    return "Computer wins!";
  }
}

function showHelpTable(moves) {
  console.log("\nHelp table:");
  let table = "  | " + moves.join(" | ") + " |\n";

  for (let i = 0; i < moves.length; i++) {
    let row = `${moves[i]} |`;
    for (let j = 0; j < moves.length; j++) {
      if (i === j) {
        row += " Draw |";
      } else {
        row += ` ${getGameResult(i, j, moves.length) === "You win!" ? "Win" : "Lose"} |`;
      }
    }
    table += row + "\n";
  }
  console.log(table);
}
