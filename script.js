import { WORDS } from "https://jtathev.github.io/words.js";
import { SUCCESS_WORDS } from "https://jtathev.github.io/success.js";
import { SORRY_WORDS } from "https://jtathev.github.io/sorry.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];

//JV ADDED 11.5.22
let guesshistory = [];
//END

let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
let successMsg = SUCCESS_WORDS[Math.floor(Math.random() * SUCCESS_WORDS.length)]
let sorryMsg = SORRY_WORDS[Math.floor(Math.random() * SORRY_WORDS.length)]

console.log(rightGuessString)

function initBoard() {
    let board = document.getElementById("game-board");

    for (let i = 0; i < NUMBER_OF_GUESSES; i++) {
        let row = document.createElement("div")
        row.className = "letter-row"
        
        for (let j = 0; j < 5; j++) {
            let box = document.createElement("div")
            box.className = "letter-box"
            row.appendChild(box)
        }

        board.appendChild(row)
    }
}

initBoard();
toastr.options.positionClass = 'toast-top-center';

document.addEventListener("keyup", (e) => {

    if (guessesRemaining === 0) {
        return
    }

    let pressedKey = String(e.key)
    if (pressedKey === "Backspace" && nextLetter !== 0) {
        deleteLetter()
        return
    }

    if (pressedKey === "Enter") {
        checkGuess()
        return
    }

    let found = pressedKey.match(/[a-z]/gi)
    if (!found || found.length > 1) {
        return
    } else {
        insertLetter(pressedKey)
    }
})

function insertLetter (pressedKey) {
    if (nextLetter === 5) {
        return
    }
    pressedKey = pressedKey.toLowerCase()

    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter]
    animateCSS(box, "pulse")
    box.textContent = pressedKey
    box.classList.add("filled-box")
    currentGuess.push(pressedKey)
    nextLetter += 1
}

function deleteLetter () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let box = row.children[nextLetter - 1]
    box.textContent = ""
    box.classList.remove("filled-box")
    currentGuess.pop()
    nextLetter -= 1
}

//checks each letter of current row
function checkGuess () {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)

    //add the latest letter to the current guess
    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!")
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not found in list!")
        return
    }

    //JV ADDED 11.5.22
    //guess is long enough and in list - add an empty row in guesshistory to be updated below
    guesshistory.push([0, 0, 0, 0, 0]);
    
    //END
    
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
            
            //JV ADDED 11.5.22
            guesshistory[6-guessesRemaining][i]=0;
            //END
        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green'
                //JV ADDED 11.5.22
                guesshistory[6-guessesRemaining][i]=1;
                //END    
            } else {
                // shade box yellow
                letterColor = 'yellow'
                //JV ADDED 11.5.22
                guesshistory[6-guessesRemaining][i]=-1;
                //END                
            }

            rightGuess[letterPosition] = "#"
        }

        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
    }

    if (guessString === rightGuessString) {
        toastr.success("You guessed right! Game over!")
        guessesRemaining = 0
        document.getElementById('success-panel').style.display = 'block';
  
        let newcontent = document.createElement('div');
        newcontent.innerHTML = successMsg;

        while (newcontent.firstChild) {
            document.getElementById('success-panel-text').appendChild(newcontent.firstChild);
        }
        
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")
            toastr.error(`The right word was: "${rightGuessString}"`)
            document.getElementById('sorry-panel').style.display = 'block';
            let sorryDiv = document.getElementById('sorry-panel-text');

            let newcontent1 = document.createElement('div');
            let newcontent2 = document.createElement('div');
            newcontent1.innerHTML = `Sorry! The right word was: <b>"${rightGuessString}"</b>. \n`
            newcontent2.innerHTML = sorryMsg;

            while (newcontent1.firstChild) {
                sorryDiv.appendChild(newcontent1.firstChild);
            }
            while (newcontent2.firstChild) {
                sorryDiv.appendChild(newcontent2.firstChild);
            }            
        }
    }
}

function shadeKeyBoard(letter, color) {
    for (const elem of document.getElementsByClassName("keyboard-button")) {
        if (elem.textContent === letter) {
            let oldColor = elem.style.backgroundColor
            if (oldColor === 'green') {
                return
            } 

            if (oldColor === 'yellow' && color !== 'green') {
                return
            }

            elem.style.backgroundColor = color
            break
        }
    }
}

//listen for clicks and convert to the right keystroke
document.getElementById("keyboard-cont").addEventListener("click", (e) => {
    const target = e.target
    
    if (!target.classList.contains("keyboard-button") && !target.classList.contains("keyboard-button-wide")) {
        return
    } 
    let key = target.textContent 

    if (key === "Del") {
        key = "Backspace"
    } 

    document.dispatchEvent(new KeyboardEvent("keyup", {'key': key}))
})

const animateCSS = (element, animation, prefix = 'animate__') =>
  // We create a Promise and return it
  new Promise((resolve, reject) => {
    const animationName = `${prefix}${animation}`;
    // const node = document.querySelector(element);
    const node = element
    node.style.setProperty('--animate-duration', '0.3s');
    
    node.classList.add(`${prefix}animated`, animationName);

    // When the animation ends, we clean the classes and resolve the Promise
    function handleAnimationEnd(event) {
      event.stopPropagation();
      node.classList.remove(`${prefix}animated`, animationName);
      resolve('Animation ended');
    }

    node.addEventListener('animationend', handleAnimationEnd, {once: true});
});

//JV ADDED 11.5.22 EVERYTHING BELOW
function convertToEmoji(guess) {
    var gsquare = String.fromCodePoint(0x1F7E9, 0xFE0F); //green
    var osquare = String.fromCodePoint(0x1F7E8, 0xFE0F); //yellow
    var esquare = String.fromCodePoint(0x1F532, 0xFE0F); //empty

    if (guess == 1) {
        return gsquare;
    } else if (guess == -1) {
        return osquare;
    } else {
        return esquare;
    }
}

function share(textIn) {
    var resultsstring = "";
    
    for (let i = 0; i < guesshistory.length; i++) { 
        for (let j = 0; j < guesshistory[i].length; j++) {
            resultsstring += convertToEmoji(guesshistory[i][j]);            
        }   resultsstring += "\n"; //add carriage return
    } 
    resultsstring += "\n" + textIn; //add the success/fail message
    copyToClipboard(resultsstring);
    toastr.success("Your results are copied to clipboard and ready to share!");
    return(resultsstring);
}

// Attach the "click" event to share buttons
document.getElementById("share-button-success").addEventListener("click", (e) => {
    let guessStr = (guesshistory.length>1) ? " guesses" :" guess";
    share("HUZZAH! I just solved today\'s Dundle in " + guesshistory.length + guessStr + "!  Head to https://www.crithitbrit.com/dundle to see if you can do better.");
})
document.getElementById("share-button-fail").addEventListener("click", (e) => {
    share("Uh oh! I was beaten by today\'s Dundle!  Will you fare better - head to https://www.crithitbrit.com/dundle to have a go.");
})

function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}
