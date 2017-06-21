import React from 'react';
import './App.css';

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      playerOneSymbol: "X",
      playerTwoSymbol: "O",
      AISymbol: "O",
      currentTurn: "X",
      currentPlayer: "human",
      currentDifficulty: "medium",
      board: [
        "", "", "", "", "", "", "", "", ""
      ],
      winner: null,
      winningCombo: null,
      xWins: null,
      oWins: null,
      easy: false,
      medium: true,
      impossible: false,
      pvp: false,
      menuVisible: false,
    }
    this.restartGame = this.restartGame.bind(this);
    this.handleDifficultyChange = this.handleDifficultyChange.bind(this);
    this.clickDropDownMenu = this.clickDropDownMenu.bind(this);
    this.checkForWinner = this.checkForWinner.bind(this);
    this.changeCurrentPlayer = this.changeCurrentPlayer.bind(this);
    this.AIMakeMove = this.AIMakeMove.bind(this);
  } // end constructor

  handleClick(index) {
    if(this.state.board[index] === "" && !this.state.winner) {
      this.state.board[index] = this.state.currentTurn // original
      this.setState((prevState) => {
        return {
          board: this.state.board,
          currentTurn: prevState.currentTurn === this.state.playerOneSymbol ? this.state.playerTwoSymbol : this.state.playerOneSymbol,
          winner: this.checkForWinner(this.state.board),
          currentPlayer: this.handleAITurn(this.state),
          xWins: this.tallyXScore(this.checkForWinner(this.state.board), this.state.xWins),
          oWins: this.tallyOScore(this.checkForWinner(this.state.board), this.state.oWins),
        }
      }) // end setState
    } // end if
  } // end handleClick

  handleDifficultyChange(event) {
    var target = event.target;
    var isChecked = target.type === 'checkbox' ? target.checked : target.value;
    var value = target.value;

    return this.setState((prevState) => {
      var lastChecked = Object.keys(prevState).filter(function(key) {
        return prevState[key] === true;
      })
      return {[value]: isChecked, [lastChecked]: false, currentDifficulty: value}
    })
  } // end handleDifficultyChange

  displayDifficulty(string) {
    if (string === "easy") {
      return "Easy";
    } else if (string === "medium") {
      return "Medium";
    } else if (string === "impossible") {
      return "Impossible"
    } else if (string === "pvp") {
      return "Play against a friend"
    }
  }

  clickDropDownMenu() {
    var isVisible = this.state.menuVisible;

    this.restartGame(); // restarts the game if menu is clicked as a workaround of the score going up on each rerender if there is a current winner

    if (isVisible) {
      this.setState((prevState) => {
        return {
          menuVisible: false,
        }
      });
    } else {
      this.setState((prevState) => {
        return {
          menuVisible: true,
        }
      });
    }
  }

  toggleDropDownMenu(bool) {
    if (bool) {
      return "show-menu"
    } else {
      return "hide-menu"
    }
  } // end toggleDropDownMenu

  menuColorToggle(bool) {
    if (bool) {
      return "checked";
    } else {
      return "unchecked";
    }
  } // end menuColorToggle

  restartGame() {
    this.setState((prevState) => {
      return {
        currentTurn: "X",
        currentPlayer: "human",
        board: [
          "", "", "", "", "", "", "", "", ""
        ],
        winner: null,
        xWins: prevState.xWins, // this and the following prevent the minimax algorithm and other calls to setState from driving up the score
        oWins: prevState.oWins,
      }
    })
  } // end restartGame

  borderToggle(currentTurn, player) {
    var winner = this.state.winner;
    if (currentTurn === "X" && player === "x" && !winner) {
      return "active";
    } else if (currentTurn === "O" && player === "o" && !winner) {
      return "active";
    } else {
      return "inactive";
    }
  }

  playByPlayUpdate(state) {
    // console.log(state)
    var gameStarted = state.board.indexOf('X'); // checks for X which will always be the first turn played
    if (gameStarted === -1) {
      return `Start game or select player`;
    } else if (state.winner) {
      // console.log(state) //console log to check final state before ending the game
      return `Game Over`;
    } else {
      return `${state.currentTurn} Turn`;
    }
  }

  checkForWinner(board) {
    var symbols = board
    var winningCombos = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6]
    ]
    var draw = symbols.indexOf('');

    for (var i = 0; i < winningCombos.length; i++) {
      var [a, b, c] = winningCombos[i];
      if (symbols[a] && symbols[a] === symbols[b] && symbols[a] === symbols[c]) {
        // console.log("winning squares: " + [a,b,c]) // used to draw winning line later
        return symbols[a]
      } // end if else check for winner
    } // end for
    if (draw === -1) { // if there is no winner, checks for draw condition
      return "draw"
    } // end if check for draw
    return null // returns winner as null and the game continues
  } // end checkForWinner

  // moved tally X and O functions out of render and are now called by handleClick so they are update immediately and without relying on react lifecycle update methods
  tallyXScore(winner, totalXWins) {
    if (winner === null && totalXWins === null) {
      return null;
    } else if (winner === "X") {
      return totalXWins += 1;
    } else {
      return totalXWins;
    }
  }

  tallyOScore(winner, totalOWins) {
    if (winner === null && totalOWins === null) {
      return null;
    } else if (winner === "O") {
      return totalOWins += 1;
    } else {
      return totalOWins;
    }
  }

  changeCurrentPlayer() {
    var gameStarted = this.state.board.indexOf('X');

    // if game didn't start
    if (gameStarted === -1) {
      return this.setState({
        currentPlayer: "AI",
      }); // end setState
    } // end if
  }

  displayWinningLine(board) {
    // console.log(arr);
    var symbols = board
    var winningCombos = [
      [0, 1, 2], // horizontal-top win
      [3, 4, 5], // horizontal-mid win
      [6, 7, 8], // horizontal-bottom win
      [0, 3, 6], // vertical-left win
      [1, 4, 7], // vertical-mid win
      [2, 5, 8], // vertical-right win
      [0, 4, 8], // diagonal from left win
      [2, 4, 6] // diagonal from right win
    ]
    var winner = this.state.winner

    // base styling consistent across all winning lines
    var styling = {
      content: "",
      margin: "0 auto",
      position: "absolute",
      zIndex: 2
    }

    // console.log(board, winningIndices, styling);
    // console.log(winningIndices === [6, 7 ,8])

    console.log()

    if (winner) {

      var winningIndices = winningCombos.find(function(combo) {
        if (symbols[combo[0]] !== "" && symbols[combo[1]] !== ""  && symbols[combo[2]] !== ""  && symbols[combo[0]] === symbols[combo[1]] && symbols[combo[1]] === symbols[combo[2]]) {
          return combo
        } else {
          return false
        }
      })

      // simple function to compare every element of the winningIndices arr to the winningCombos arrs
      function compareArrs(winningArr, comboArr) {
        return winningArr.every(function(element, index) {
          return element === comboArr[index]
        })
      }

      if (winner === "X") {
        styling["color"] = "#545454";
      } else {
        styling["color"] = "#f2ebd3";
      }

      if (compareArrs(winningIndices, [0, 1, 2])) {
        styling["borderTop"] = "4px solid"
        styling["top"] = "14.5%"
        styling["left"] = 0
        styling["right"] = 0
        styling["bottom"] = 0
      } else if (compareArrs(winningIndices, [3, 4, 5])) {
        styling["borderTop"] = "4px solid"
        styling["top"] = "48.2%"
        styling["left"] = 0
        styling["right"] = 0
        styling["bottom"] = 0
      } else if (compareArrs(winningIndices, [6, 7, 8])) {
        styling["borderTop"] = "4px solid"
        styling["top"] = "82%"
        styling["left"] = 0
        styling["right"] = 0
        styling["bottom"] = 0
      } else if (compareArrs(winningIndices, [0, 3, 6])) {
        styling["borderLeft"] = "4px solid"
        styling["top"] = 0
        styling["left"] = "15%"
        styling["right"] = 0
        styling["bottom"] = 0
      } else if (compareArrs(winningIndices, [1, 4, 7])) {
        styling["borderLeft"] = "4px solid"
        styling["top"] = 0
        styling["left"] = "49%"
        styling["right"] = 0
        styling["bottom"] = 0
      } else if (compareArrs(winningIndices, [2, 5, 8])) {
        styling["borderLeft"] = "4px solid"
        styling["top"] = 0
        styling["left"] = "83%"
        styling["right"] = 0
        styling["bottom"] = 0
      } else if (compareArrs(winningIndices, [0, 4, 8])) {
        styling["borderTop"] = "4px solid"
        styling["top"] = 0
        styling["left"] = "2%"
        styling["right"] = 0
        styling["bottom"] = 0
        styling["transform"] = "rotate(45deg)"
        styling["transformOrigin"] = "0% 0%"
        styling["width"] = "140%"
        styling["height"] = 0
      } else if (compareArrs(winningIndices, [2, 4, 6])) {
        styling["borderLeft"] = "4px solid"
        styling["top"] = 0
        styling["left"] = "98%"
        styling["right"] = 0
        styling["bottom"] = 0
        styling["transform"] = "rotate(45deg)"
        styling["transformOrigin"] = "0% 0%"
        styling["height"] = "140%"
      }

      return styling
    } else {
      return
    }
  }


  AIMakeMove(state) {
    var currentDifficulty = state.currentDifficulty;
    var currentPlayer = state.currentPlayer;

    // helper function to find all available squares
    function findOpenSquares(arr, targetArr) {
      arr.forEach(function(cell, index) {
        if (cell.length === 0) {
          targetArr.push(index);
        }
      });
    } // end findOpenSquares

    var getRandomScoreIndex = (scoresArr, val, difficulty, optimal) => {

      // find currently open squares on the board to rule out the zeros of already played spaces in the tallyScores arr
      var openSquares = [];
      var tempScores = [];

      findOpenSquares(state.board, openSquares);

      openSquares.forEach(function(square) {
        // push the scores to a tempScores arr for processing
        tempScores.push(scoresArr[square]);
      });

      // min or max score
      var targetScore;

      // update targetScore based on arguments passed to getRandomScoreIndex function
      if (difficulty === "impossible") {

        if (val === "min") {
          targetScore = Math.min.apply(null, tempScores);
        } else {
          targetScore = Math.max.apply(null, tempScores);
        }

      } else if (difficulty === "medium") {

        if (openSquares.length === 1) {
          // handles cases where the target score cannot be sorted because there is only 1 open square
          return openSquares[0];
        } else if (optimal) {
          if (val === "min") {
            targetScore = Math.min.apply(null, tempScores);
          } else if (val === "max") {
            targetScore = Math.max.apply(null, tempScores);
          }
        } else if (!optimal) {
          if (val === "min") {
            // console.log('working !optimal min')
            var targetScore = tempScores.sort(function(a, b) {return a - b;})[1];
          } else if (val === "max") {
            // console.log('working !optimal max')
            var targetScore = tempScores.sort(function(a, b) {return b - a;})[1];
          }
        } // end if / else optimal
      }

      // console.log(targetScore);

      // reduce tempScores to new array containing only that number
      var scoresIndexes = tempScores.reduce(function(acc, num, index) {
        if (num === targetScore) {
          return acc.concat(openSquares[index]);
        } else {
          return acc;
        }
      }, []);

      // console.log(tempScores, scoresIndexes)

      // finally, return a random index of minNumIndexes if the length of minNums > 1
      // console.log(targetScore, tempScores, openSquares, scoresIndexes);
      if (scoresIndexes.length > 1) {
        // below so that the last index of the minNumIndexes is included as a possible random number
        var maxLength = Math.floor(scoresIndexes.length);
        var randomIndex = Math.floor(Math.random() * (maxLength - 0)) + 0;
        // return a random index of the scoresIndexes of scoresArr / tallyScores
        // console.log(scoresIndexes[randomIndex]);
        return scoresIndexes[randomIndex];
      } else if (scoresIndexes.length === 1) {
        return scoresIndexes[0]; // there is only one index in this arr, so return whatever open square that is
      }

      // else if (scoresIndexes.length === 1 && val === "min") {
      //   return scoresIndexes[0]; // there is only one index in this arr, so return whatever open square that is
      // } else if (scoresIndexes.length === 1 && val === "max") {
      //   return scoresArr.indexOf(targetScore); // returns the index of whatever the maximum score is from the scoresArr that was passed to the function
      // }
    } // end getRandomScoreIndex

    let minimaxScore = (board, boardCurrentTurn, depth) => { // need to use ES6 conventions and arrow function here to pass the checkForWinner function in
      var gameWon = this.checkForWinner(board);
      var playedSymbol = boardCurrentTurn === 'X' ? 'O' : 'X';
      var opponent = state.currentTurn === 'O' ? 'X' : 'O';

      // console.log(board, gameWon, playedSymbol, opponent, depth);

      if (gameWon === playedSymbol) {
        // console.log(10 - depth);
        return 10 - depth; // if 11, kinda cheating by nudging the algorithm toward obvious wins when faced with a win vs tie state
        // return 11 - depth;
      } else if (gameWon === opponent) {
        return depth - 10; // --original
      } else {
        return 0;
      }
    }

    let minimax = (board) => {

      // terminal game state is the base case
      if (this.checkForWinner(board)) {
        // return board as is
        return board;
      } else {

        // calculate depth based on turns played in current state
        var depth = 0;
        board.forEach(function(square) {
          if (square.length > 0) {
            depth += 1;
          }
        });

        // useful for turn swtiching during recursion
        let currentPlayerChecker = (board) => {
          var turnsPlayed = 0;
          // count how many turns have been played
          board.forEach(function(square) {
            if (square === "X" || square === "O") {
              turnsPlayed += 1;
            }
          });

          // if an even number of turnsPlayed, return X, else, O --> NOTE: Might be easier to read if just counting turns left to play
          if (turnsPlayed === 9) { // this is to prevent the currentTurn from showing O in a terminal game with the board filled, though this might not be necessary
            return "X";
          } else if (turnsPlayed % 2 === 0) {
            return "X";
          } else {
            return "O";
          }
        }

        // helper function to generate a board and divorce it from the react state
        function generatePossibleState(board) {
          var newBoard = board;
          return newBoard.map(function(cell) {
            return cell;
          })
        } // end generatePossibleState

        // helper function to fill the board with either symbol
        function fillState(board, index, symbol) {
          board[index] += symbol;
          return board;
        }

        // helper function to determine turns left for later filtering
        function calcTurnsLeft(board) {
          var count = 9;
          board.forEach(function(square) {
            if (square === "O" || square === "X") {
              count -= 1;
            }
          });
          return count;
        } // end calcTurnsLeft

        var tallyScores = [0,0,0,0,0,0,0,0,0]; // used to calculate best move for AIPlayer

        // generates all possible moves
        let populateAllStates = (paramBoard, depth) => {
          // terminal state
          if (paramBoard.indexOf("") === -1) {
            //return possibleStates;
            return tallyScores;
          } else {

            // add 1 to depth for each level of tree nodes
            depth += 1;

            var nextStates = [];
            var currentSquares = [];

            findOpenSquares(paramBoard, currentSquares);

            currentSquares.forEach((square) => {
              var newBoard = generatePossibleState(paramBoard);
              var nextState = fillState(newBoard, square, currentPlayerChecker(paramBoard));
              var turnsLeft = calcTurnsLeft(newBoard);
              // console.log(nextState, currentSquares); // need to find way to push up scores from future winning states

              // push next state to above nextStates array for processing
              nextStates.push(nextState); // --> original

              // push object of scores, square index, and other values -- useful for debeugging
              // scores.push({lastBoard: paramBoard, board: nextState, score: minimaxScore(nextState, currentPlayerChecker(nextState), depth), square: square, turnsLeft: turnsLeft, depth: depth, winner: this.checkForWinner(nextState)}); // --> original

              var score = minimaxScore(nextState, currentPlayerChecker(nextState), depth);
              tallyScores[square] += score;
            });

            // check each board in arr for winning state
            nextStates.forEach((nextBoard) => {
              // console.log(nextBoard, this.checkForWinner(nextBoard));
              if (!this.checkForWinner(nextBoard)) {
                return populateAllStates(nextBoard, depth); // recursion to fill all possible states with the correct symbol
              } else {
                return nextBoard;
              }
            }); // end nextStates.forEach
          }
        } // end populateAllStates

        populateAllStates(board, depth);
        // console.log(scores);

        return tallyScores;

      } // end else
    } // end minimax

    function easyMove(board) {
      var availableSquares = [];
      board.forEach(function(cell, index) {
        if (cell.length === 0) {
          availableSquares.push(index);
        }
      });
      var randomSquare = availableSquares[Math.floor(Math.random() * availableSquares.length)];

      return randomSquare;
    } // end easyMove

    function mediumMove(board) {

      // store percentage of time this AI should make an optimal move
      var probability = 40;
      var roll = Math.random() * 100;
      var gameStarted = board.indexOf("X");

      // special case if the player chooses to be O -- AI chooses from either the best space, or one of the corners depending on the roll

      if (gameStarted === -1 && roll <= probability) {
        return 4;
      } else if (gameStarted === -1 && roll > probability) {
        var corners = [0, 2, 6, 8];
        // below so that the last index of the minNumIndexes is included as a possible random number
        var randomIndex = Math.floor(Math.random() * (corners.length - 0)) + 0;
        return corners[randomIndex];
      } else if (gameStarted > -1) {
        var boardScores = minimax(board);
        var boardScoresHighestVal = Math.max.apply(null, boardScores); // a quick way to check the highest value and see wheter to pick a random max or random min score index -- though unlikely, this will prevent possible problems that may arise when the AI is faced with a tallyScores arr of [-1, 0], with -1 representing the score of a blocking move to prevent the player from winning. In this scenario the AI has no way to win, but can lose, resulting in a lower score. In this case the AI should take the role of the minimizer to prolong the game

        if (roll <= probability) {
          if (boardScoresHighestVal <= 0) {
            return getRandomScoreIndex(boardScores, "min", "medium", true);
          } else {
            return getRandomScoreIndex(boardScores, "max", "medium", true);
          }
        } else {
          // console.log('working greater than probability', roll)
          if (boardScoresHighestVal <= 0) {
            return getRandomScoreIndex(boardScores, "min", "medium", false);
          } else {
            return getRandomScoreIndex(boardScores, "max", "medium", false);
          }
        }
      }  // end gameStarted if/else if

    } // end mediumMove

    function impossibleMove(board) {
      var firstMove = state.board.indexOf("X");

      // if first move not played, return the possible move to lower minimax overhead
      if (firstMove === -1) {
        // console.log('working AI Impossible First Move');
        return 4; // index of center board position
      } else if (firstMove >= 0) { // AI needs to make either the second or thrid move

        // runs minimax and stores and arr of the current board's scores
        var boardScores = minimax(board);

        var boardScoresHighestVal = Math.max.apply(null, boardScores); // a quick way to check the highest value and see wheter to pick a random max or random min score index -- though unlikely, this will prevent possible problems that may arise when the AI is faced with a tallyScores arr of [-1, 0], with -1 representing the score of a blocking move to prevent the player from winning. In this scenario the AI has no way to win, but can lose, resulting in a lower score. In this case the AI should take the role of the minimizer to prolong the game

        // return best possible move given the current board state
        if (boardScoresHighestVal <= 0) {
          return getRandomScoreIndex(boardScores, "min", "impossible");
        } else {
          return getRandomScoreIndex(boardScores, "max", "impossible");
        }

      } // end if/else
    } // end impossibleMove

    if (!this.checkForWinner(state.board)) { // checks for winner to prevent unnecessary calculations
      if (currentDifficulty === "easy" && currentPlayer === "AI") {
        this.handleClick(easyMove(state.board));
      } else if (currentDifficulty === "medium" && currentPlayer === "AI") {
        this.handleClick(mediumMove(state.board));
      } else if (currentDifficulty === "impossible" && currentPlayer === "AI") {
        this.handleClick(impossibleMove(state.board));
      }
    } // end check for winner
  } // end AIMakeMove

  handleAITurn(state) {
    var currentPlayer = state.currentPlayer;
    var pvp = state.pvp;

    if (!pvp && currentPlayer === "human") {
      return "AI";
    } else if (!pvp && currentPlayer === "AI") {
      return "human";
    }
  }

  // AIMakeMove called here because instances of a player taking a move or chosing the O symbol both cause a rerender, which triggers the componentDidUpdate method
  componentDidUpdate(prevProps, prevState) {
    if (!this.state.winner) {
      this.AIMakeMove(this.state);
    }
  }

  render() {

    return (
      <div className="content">
        <div className="app-container">
          <div className="upper-div">
            <div className="difficulty-container">
              <div className="difficulty-select" onClick={() => this.clickDropDownMenu()}>
                <span className="current-difficulty">{this.displayDifficulty(this.state.currentDifficulty)}</span>
              </div>
              {/* end difficulty-select */}
              <ul className={`difficulty-drop-down ${this.toggleDropDownMenu(this.state.menuVisible)}`}>
                <div className="menu-item">
                  <label className={`menu-label ${this.menuColorToggle(this.state.easy)}`} for="easy">
                    <input type="checkbox" id="easy" label="easy" value="easy" onChange={this.handleDifficultyChange} checked={this.state.easy} onClick={() => this.clickDropDownMenu()}/>
                    Easy
                  </label>
                </div>
                <div className="menu-item">
                  <label className={`menu-label ${this.menuColorToggle(this.state.medium)}`} for="medium">
                    <input type="checkbox" id="medium" label="medium" value="medium" onChange={this.handleDifficultyChange} checked={this.state.medium} onClick={() => this.clickDropDownMenu()}/>
                    Medium
                  </label>
                </div>
                <div className="menu-item">
                  <label className={`menu-label ${this.menuColorToggle(this.state.impossible)}`} for="impossible">
                    <input type="checkbox" id="impossible" label="impossible" value="impossible" onChange={this.handleDifficultyChange} checked={this.state.impossible} onClick={() => this.clickDropDownMenu()}/>
                    Impossible
                  </label>
                </div>
                <div className="menu-item">
                  <label className={`menu-label ${this.menuColorToggle(this.state.pvp)}`} for="pvp">
                    <input type="checkbox" id="pvp" label="pvp" value="pvp" onChange={this.handleDifficultyChange} checked={this.state.pvp} onClick={() => this.clickDropDownMenu()}/>
                    Play against a friend
                  </label>
                </div>
              </ul>
            </div>
            {/* end difficulty-container */}
            <div className="scoreboard">
              {/* this.tallyScore(this.state.winner) */}
              <div className={`player-x ${this.borderToggle(this.state.currentTurn, "x")}`} onClick={() => this.changeCurrentPlayer()} >
                <div className="x-label">
                  X
                </div>
                <div className="x-score">
                  {this.state.xWins === null ? '-' : this.state.xWins}
                </div>
              </div>
              {/* end player-x */}
              <div className={`player-o ${this.borderToggle(this.state.currentTurn, "o")}`} onClick={() => this.changeCurrentPlayer()}>
                <div className="o-label">
                  O
                </div>
                <div className="o-score">
                  {this.state.oWins === null ? '-' : this.state.oWins}
                </div>
              </div>
              {/* end player-o */}
            </div>
            {/* end scoreboard */}
            <span className="play-by-play">
              {this.playByPlayUpdate(this.state)}
            </span>
          </div>
          {/* end upper div */}
          <div className="board-container">
            <div className="board">
              <div className="winning-line" style={this.displayWinningLine(this.state.board)}></div>
              {this.state.board.map((cell, index) => {
                return <div onClick={() => this.handleClick(index)} className={`square ${`square-` + index} ${this.state.board[index]}`}>{cell}</div>;
              })}
              {/* renders the board, iterates through the squares, handles click events and sets the X or O, and sets class names based on index, and turn played in square*/}
              {/* this.AIMakeMove(this.state) */}
            </div>
            {/* end board */}
          </div>
          {/* end board-container */}
          <div className="restart" onClick={() => this.restartGame()}>
            Restart Game
          </div>
          {/* end buttons */}
        </div>
        {/* end app-container */}
      </div>
      // end content
    ) // end return
  } // end render
} // end App Component

export default App;
