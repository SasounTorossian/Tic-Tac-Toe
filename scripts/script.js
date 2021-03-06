
// ===== OPTIONS MENU =====
const optionsMenu = (() => {      
    let playerForm = document.querySelector(".player-form")
    let startScreen = document.querySelector(".start-screen")

    let playerScreen = document.querySelector(".player-screen")
    playerScreen.classList.add("screen-hidden")

    let gameInfo = document.querySelector(".gameInfo p")

    let radioContainer = document.querySelector(".radio-container")
    let player2NameLabel = document.querySelector("#p2-name-label")
    let submitBtn = document.querySelector(".submit-button")
    
    let gameBoardContainer = document.getElementsByClassName("game-board")[0]
    gameBoardContainer.classList.add("screen-hidden")

    let gameMode
    let AiDifficulty
    let player1Name
    let player2Name

    // Resets input form and variables.
    const resetMenu = () => {
        playerForm.reset()
        player1Name = ""
        player2Name = ""
        gameMode = ""
        AiDifficulty = ""
    }

    // Creates player objects and passes them to game engine for initialization
    const PassOptionsToGameEngine = () => {
        let player1 = Player(player1Name, "X")
        let player2
        if(gameMode == "PvP") player2 = Player(player2Name, "O")
        else player2 = AI(player2Name, "O", AiDifficulty)
        gameBoardContainer.innerHTML = ""
        gameEngine.startGame(player1, player2, gameMode)
        resetMenu()
    }

    // Submits form data to PassOptionsToGameEngine function.
    submitBtn.addEventListener('click', (e) => {
        player1Name = document.querySelector('#p1-name-input').value
        player2Name = document.querySelector('#p2-name-input').value
        if(gameMode == "PvAi") {
            AiDifficulty = document.querySelector('input[type="radio"]:checked').value
        }
        if (!player1Name || !player2Name || 
            (player1Name == player2Name) ||
            (gameMode == "PvAi" && !AiDifficulty)) {
                return
            }
        hideElementWithFade(playerScreen)
        setTimeout(() => PassOptionsToGameEngine() , 500)
    })

    // Start screen to choose game type.
    startScreen.querySelectorAll(".start-tile").forEach(element => {
        element.addEventListener('click', (e) => {
            if(e.currentTarget.id == "PvP") {
                gameMode = "PvP"
                radioContainer.classList.add("screen-hidden")
                player2NameLabel.innerText = "Player 2 Name"
            }
            else {
                gameMode = "PvAi"
                radioContainer.classList.remove("screen-hidden")
                player2NameLabel.innerText = "Ai Name"
            }
            hideElementWithFade(startScreen)
            setTimeout(() => showElementWithFade(playerScreen) , 500)
        })                
    })

    // Adds transition class to element, then removes hidden class for smooth fade-in
    const showElementWithFade = (elem) => {
        if(elem.classList.contains("tile")) {
            elem.classList.add("mark-transition")
            elem.clientWidth
            elem.classList.remove("mark-hidden")
        }
        else {
            elem.classList.add("screen-transition")
            elem.clientWidth
            elem.classList.remove("screen-hidden")
        }
    }

    // Ads transition class to element, then adds hidden class for smooth fade-out
    const hideElementWithFade = (elem) => {
        if (elem == gameBoardContainer) {
            elem.classList.add("screen-transition-grid")
        }
        elem.classList.add("screen-transition")
        elem.classList.add("screen-hidden")
    }

    // Transition end events to remove transition class when element finishes animation.
    startScreen.addEventListener('transitionend', (e) => {
        startScreen.classList.remove("screen-transition")
    })

    playerScreen.addEventListener('transitionend', (e) => {
        playerScreen.classList.remove("screen-transition")
    })

    gameInfo.addEventListener('transitionend', (e) => {
        gameInfo.classList.remove("screen-transition")
    })

    gameBoardContainer.addEventListener('transitionend', (e) => {
        gameBoardContainer.classList.remove("screen-transition-grid")
        gameBoardContainer.classList.remove("screen-transition")
    })

    resetBtn = document.getElementsByClassName("reset-button")[0]
    resetBtn.addEventListener('transitionend', (e) => {
        startScreen.classList.remove("screen-transition")
    })

    return {
        showElementWithFade,
        hideElementWithFade
    }

})()



// ===== PLAYER =====
const Player = (name, mark) => {
    let playerName = name
    let playerMark = mark

    return {
        playerName,
        playerMark
    }
}

// ===== AI =====
const AI = (name, mark, aiD) => {
    let playerName = name
    let playerMark = mark
    let AiDifficulty = aiD

    // Begins Ai gameplay. Places intital O mark then begins minimax algorithm to find best option.
    const AiPlay = (gameBoardArray) => {
        let bestScore = -Infinity
        let bestMove
        let searchDepth = 9
        let isMaximising = false

        for(let i = 0; i < gameBoardArray.length; i++) {
            if(gameBoardArray[i] == "") {
                gameBoardArray[i] = "O"
                let score = minimax(gameBoardArray, searchDepth - 1, -Infinity, Infinity, isMaximising)
                gameBoardArray[i] = ""

                if (score > bestScore) {
                    bestScore = score
                    bestMove = i
                }
            }
        }   

        // Delay mark placement to give Ai a "thinking" period.
        setTimeout(() => placeMarkandCheckGame(gameBoardArray, bestMove) , 1000)

    }

    // Places mark down and updates gameboard array. Mark is slowly faded in.
    const placeMarkandCheckGame = (gameBoardArray, bestMove) => {
        gameBoardArray[bestMove] = playerMark
        let div = document.querySelector(`[index="${bestMove}"]`)
        div.classList.add("mark-hidden")
        div.innerText = playerMark
        
        // Calling optionsMenu.showElementWithFade(div) normally doesn't work. Needs 10ms del to prevent instantaneous appearance. Caused by function exiting too early and forcing a transition.
        setTimeout(() => optionsMenu.showElementWithFade(div) , 10)
        gameBoard.checkGameOver()  
    }

    // Grouping of functions used to determine AI difficulty. Assigns weighting to final minimax score based on dificulty chosen.
    const getRandomDec = (a, b) => (Math.random() * (a - b) + b).toFixed(1)

    const easyMode = () => getRandomDec(0.1, 0.2)

    const mediumMode = () => getRandomDec(0.5, 0.6)

    const hardMode = () => getRandomDec(0.9, 1.0)

    const difficultyWeighting = (aiD) => {
        if (aiD == "easy") return easyMode()
        else if (aiD == "medium") return mediumMode()
        else if (aiD == "hard") return hardMode()
        else return 1
    }

    // Converts string result of checkGameboard() func into a score value.
    let scores = {
        "O": 10,
        "X": -10,
        "TIE": 0
    }

    // Minimax algorithm implementation, using alpha-beta pruning to speed up calculations. 
    const minimax = (gameBoardArray, depth, alpha, beta, isMaximising) => {
        let result = gameBoard.checkGameboard()
        if (result !== null) return scores[result]
        if (depth == 0) return scores["TIE"]
        
        // AI's turn
        if(isMaximising) {
            let maxScore = -Infinity
            for(let i = 0; i < gameBoardArray.length; i++) {
                if(gameBoardArray[i] == "") {
                    gameBoardArray[i] = "O"
                    let score = minimax(gameBoardArray, depth - 1, alpha, beta, !isMaximising)
                    gameBoardArray[i] = ""
                    maxScore = Math.max(score / difficultyWeighting(AiDifficulty), maxScore)
                    alpha = Math.max(alpha, score)
                    if(beta <= alpha) break
                }
            }
            return maxScore + depth
        }
        else {
            let minScore = Infinity
            for(let i = 0; i < gameBoardArray.length; i++) {
                if(gameBoardArray[i] == "") {
                    gameBoardArray[i] = "X"
                    let score = minimax(gameBoardArray, depth - 1, alpha, beta, !isMaximising)
                    gameBoardArray[i] = ""
                    minScore = Math.min(score * difficultyWeighting(AiDifficulty), minScore)
                    beta = Math.min(beta, score)
                    if(beta <= alpha) break
            
                }
            }
            return minScore - depth
        }
    }

    return {
        playerName,
        playerMark,
        AiPlay
    }

}

// ===== GAME ENGINE =====
const gameEngine = (() => {
    let gameInfo = document.querySelector(".gameInfo p")
    gameInfo.classList.add("screen-hidden")
    let gameBoardContainer = document.querySelector(".game-board")
    let gameEnd = false
    let gameMode
    let AiDifficulty
    let players = []
    let currentPlayer

    let startScreen = document.querySelector(".start-screen")

    // Initializes gameboard and gameEngine variables.
    const startGame = (p1, p2, gm) => {
        addPlayers(p1, p2)
        gameBoard.startGameBoard()
        
        gameEnd = false
        gameMode = gm
        optionsMenu.showElementWithFade(gameInfo)
        gameInfoWrite(`Current player is ${getCurrentPlayer().playerName}`)
    }

    // Adds players to players[] array, then assigns the first player to go first
    const addPlayers = (p1, p2) => {
        players.push(p1)
        players.push(p2)
        assignPlayers()
    }

    // Assigns first player in players[] array as the current player
    const assignPlayers = () => currentPlayer = players[0]

    // Switches current player, updates game info screen to alert user. If current player is the Ai, and game mode is set to Ai, then call AiPlay() function
    const nextTurn = (gameBoard) => {
        switchPlayer()
        gameInfoWrite(`Current player is ${getCurrentPlayer().playerName}`)
        console.log(getCurrentPlayer().playerName)
        if (currentPlayer == players[1] && gameMode == "PvAi") currentPlayer.AiPlay(gameBoard)
    }

    // Alternates between players
    const switchPlayer = () => {
        currentPlayer = (currentPlayer == players[0]) ? players[1] : players[0]
    }

    // If game over, alert user(s) and reveal reset button via fade-in.
    const gameOverScenario = (result) => {
        if(result == "TIE") gameInfoWrite(`It's a tie.`)
        else gameInfoWrite(`Congrats, ${getCurrentPlayer().playerName} won`)

        gameEnd = true
        optionsMenu.showElementWithFade(resetBtn)
    }

    // Creates reset button and assigns event to it. When reset button is pressed, gameinfo, gameboard, and reset button are all faded out, and initial start screen is faded in
    resetBtn = document.getElementsByClassName("reset-button")[0]
    resetBtn.classList.add("screen-hidden")
    resetBtn.addEventListener('click', (e) => {
        optionsMenu.hideElementWithFade(gameInfo)
        optionsMenu.hideElementWithFade(gameBoardContainer)
        optionsMenu.hideElementWithFade(resetBtn)
        setTimeout(() => optionsMenu.showElementWithFade(startScreen) , 500)

        players.length = 0
    })

    // Helper functions for overall code.
    const getPlayers = () => players

    const getCurrentPlayer = () => currentPlayer

    const getGameMode = () => gameMode

    const gameInfoWrite = (string) => gameInfo.innerText = string

    const isGameOver = () => gameEnd

    return {
        startGame,
        switchPlayer,
        getPlayers,
        getCurrentPlayer,
        gameOverScenario,
        isGameOver,
        nextTurn,
        getGameMode
    }

})()

// ===== GAME BOARD =====
const gameBoard = (() => {
    let gameBoardContainer = document.getElementsByClassName("game-board")[0]

    let gameBoardArray = new Array(9).fill("")

    // StartGameboard renders gameboard. Separate function due to possibility of adding functionality later.
    const startGameBoard = () => {
        renderGameboard()
    }

    // Sets all elements of gameboard array back to ""
    const resetGameBoard = () => {
        gameBoardArray = gameBoardArray.map(el => "")
    }

    // Adds player mark. If gameover or space not empty, return.
    const addMark = (e) => {
        let div = e.target
        let index = div.getAttribute("index")
        div.classList.add("mark-hidden")

        // If currently Ai's turn, prevent player from putting in Ai's mark for them.
        if (gameEngine.getCurrentPlayer() == gameEngine.getPlayers()[1] && gameEngine.getGameMode() == "PvAi") return
        if(gameEngine.isGameOver()) return
        if(div.innerText != "") return

        let mark = gameEngine.getCurrentPlayer().playerMark
        gameBoardArray[index] = mark
        div.innerText = mark
        optionsMenu.showElementWithFade(div)
        checkGameOver()   
    }

    // Renders gameboard by creating div for each gameboard array element. Assigns array index to div as attribute.
    const renderGameboard = () => {
        gameBoardArray.forEach(function(elem, idx) {
            let div = document.createElement("div")
            div.classList.add("tile")
            div.setAttribute("index", idx)
            div.addEventListener('click', addMark)
            gameBoardContainer.appendChild(div)
        })
        optionsMenu.showElementWithFade(gameBoardContainer)
    }

    // Check status of game to see if over. If not then call nextTurn(), if so then call gameOverScenario() from game engine.
    const checkGameOver = () => {
        if(checkGameboard() == null) {
            gameEngine.nextTurn(gameBoardArray)
        }
        else {
            gameEngine.gameOverScenario(checkGameboard())
            resetGameBoard()
        }
    }
    
    // List of array positions that, if of similar mark, would inidicate a winning combination.
    const winningCombos = [["0", "1", "2"], /* Top horizontal     */
                            ["3", "4", "5"], /* Middle horizontal  */
                            ["6", "7", "8"], /* Bottom horizontal  */
                            ["0", "3", "6"], /* Left vertical      */
                            ["1", "4", "7"], /* Middle vertical    */
                            ["2", "5", "8"], /* Right vertical     */
                            ["0", "4", "8"], /* Top-left diagonal  */
                            ["2", "4", "6"]] /* Top-right diagonal */

    // Cycles through winning combo array and checks against current gameboard array to find winning player. Returns tie if gameboard is full, returns null if game is ongoing.
    const checkGameboard = () => {
        let player1Win = winningCombos.some(arr => 
                                    arr.every(el => 
                                    gameBoardArray[el] == "X")) 

        let player2Win = winningCombos.some(arr => 
                                    arr.every(el => 
                                    gameBoardArray[el] == "O"))

        let playerTie = gameBoardArray.every(el => el != "")

        if (player1Win) return "X"
        if (player2Win) return "O"
        if (playerTie) return "TIE"
        return null
    }           

    return {
        startGameBoard,
        checkGameboard,
        checkGameOver
    }
})()