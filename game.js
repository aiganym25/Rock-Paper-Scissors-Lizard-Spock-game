const crypto = require("crypto");
const readline = require("readline");

const key = crypto.randomBytes(32);

class Game {
  constructor(moves) {
    this.moves = moves;
    this.rules = this.generateRules();
  }

  generateRules() {
    const rules = {};

    for (const move1 of this.moves) {
      const row = {};
      for (const move2 of this.moves) {
        const formattedMove1 = move1.toLowerCase();
        const formattedMove2 = move2.toLowerCase();

        if (formattedMove1 === formattedMove2) {
          row[move2] = "Draw";
        } else {
          row[move2] = this.determineOutcome(formattedMove1, formattedMove2);
        }
      }

      rules[move1] = row;
    }
    // console.log(rules);

    return rules;
  }

  determineOutcome(move1, move2) {
    switch (`${move1}-${move2}`) {
      case "rock-scissors":
      case "rock-lizard":
      case "scissors-paper":
      case "scissors-lizard":
      case "paper-rock":
      case "paper-spock":
      case "spock-rock":
      case "spock-scissors":
      case "lizard-paper":
      case "lizard-spock":
        return "You";
      case "rock-paper":
      case "rock-spock":
      case "scissors-rock":
      case "scissors-spock":
      case "paper-scissors":
      case "paper-lizard":
      case "spock-paper":
      case "spock-lizard":
      case "lizard-rock":
      case "lizard-scissors":
        return "Computer";
      default:
        return "Draw";
    }
  }

  getWinner(playerMove, computerMove) {
    if (playerMove === computerMove) {
      return "Draw";
    } else if (this.rules[playerMove][computerMove] === "You") {
      return "You";
    } else {
      return "Computer";
    }
  }

  displayMoves() {
    console.log("Available moves:");
    this.moves.forEach((move, index) => {
      console.log(`${index + 1} - ${move}`);
    });
    console.log("0 - exit");
    console.log("? - help");
  }

  displayHelpTable() {
    const maxMoveLength = Math.max(...this.moves.map((move) => move.length));
    const columnWidth = maxMoveLength + 2;
    const columnSeparator = "+-" + "-".repeat(columnWidth) + "-";

    const separatorLength = (columnWidth + 1) * (this.moves.length + 2);
    const separator = "+-" + "-".repeat(separatorLength) + "+";

    console.log(separator);
    const header = `| v PC\\User > | ${this.moves
      .map((move) => move.padEnd(columnWidth))
      .join(` | `)} |`;
    console.log(header);
    console.log(separator);

    for (const rowMove of this.moves) {
      let row = `| ${rowMove.padEnd(columnWidth)}`;

      for (const colMove of this.moves) {
        const outcome = this.rules[rowMove][colMove];
        const result =
          outcome === "You" ? "Win" : outcome === "Computer" ? "Lose" : "Draw";
        row += ` | ${result.padEnd(columnWidth)}`;
      }

      row += " |";
      console.log(row);
      console.log(columnSeparator.repeat(this.moves.length + 1));
    }
  }
}

function generateHmac(message) {
  const hmac = crypto.createHmac("sha256", key).update(message).digest("hex");
  return hmac;
}

function validateArguments(args) {
  if (args.length < 3) {
    console.log("Usage: node game.js move1 move2 move3 ...");
    return false;
  }
  if (args.length % 2 !== 1) {
    console.log("The length of the args should be odd");
    return;
  }

  const uniqueMoves = new Set(args);
  if (uniqueMoves.size !== args.length) {
    console.log("Error: All moves must be unique.");
    return false;
  }

  return true;
}

function main() {
  const args = process.argv.slice(2);

  if (!validateArguments(args)) {
    return;
  }

  const computerMove = args[Math.floor(Math.random() * args.length)];
  const hmacCode = generateHmac(computerMove);
  console.log(`HMAC: ${hmacCode}`);

  const game = new Game(args);
  game.displayMoves();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question("Enter your move: ", (playerInput) => {
    if (playerInput === "0") {
      rl.close();
      return;
    } else if (playerInput === "?") {
      game.displayHelpTable();
      rl.close();
      return;
    }

    const playerMoveIndex = parseInt(playerInput) - 1;
    if (
      !isNaN(playerMoveIndex) &&
      playerMoveIndex >= 0 &&
      playerMoveIndex < args.length
    ) {
      const playerMove = args[playerMoveIndex];
      console.log(`Your move: ${playerMove}`);
      console.log(`Computer move: ${computerMove}`);

      const winner = game.getWinner(playerMove, computerMove);
      if (winner === "Draw") {
        console.log(`It's a ${winner.toUpperCase()}`);
      } else {
        console.log(`${winner.toUpperCase()} win!`);
      }

      console.log(`HMAC key: ${key.toString("hex")}`);

      rl.close();
    } else {
      console.log("Invalid input. Please try again.");
      rl.close();
    }
  });
}

main();
