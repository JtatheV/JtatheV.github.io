import { WORDS } from "https://jtathev.github.io/words.js";
import { SUCCESS_WORDS } from "https://jtathev.github.io/success.js";
import { SORRY_WORDS } from "https://jtathev.github.io/sorry.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let guesshistory = [];

let nextLetter = 0;
let rightGuessString = WORDS[Math.floor(Math.random() * WORDS.length)]
let successMsg = SUCCESS_WORDS[Math.floor(Math.random() * SUCCESS_WORDS.length)]
let sorryMsg = SORRY_WORDS[Math.floor(Math.random() * SORRY_WORDS.length)]
let resultsstring = "";
let resultsstringTweet = "";

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
//toastr.options.positionClass = 'toast-center-center';
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
        toastr.error("Not enough letters!");
        return
    }

    if (!WORDS.includes(guessString)) {
        toastr.error("Word not found in list!");
        return
    }

    //guess is long enough and in list - add an empty row in guesshistory to be updated below
    guesshistory.push([0, 0, 0, 0, 0]);
    
    
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        // is letter in the correct guess
        if (letterPosition === -1) {
            letterColor = 'grey'
            
            guesshistory[6-guessesRemaining][i]=0;

        } else {
            // now, letter is definitely in word
            // if letter index and right guess index are the same
            // letter is in the right position 
            if (currentGuess[i] === rightGuess[i]) {
                // shade green 
                letterColor = 'green'
                guesshistory[6-guessesRemaining][i]=1;
            } else {
                // shade box yellow
                letterColor = 'yellow'
                guesshistory[6-guessesRemaining][i]=-1;             
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
        toastr.success("Huzzah! You guessed right!")
        guessesRemaining = 0

        //add success message to results panel
        let newcontent1 = document.createElement('div');
        newcontent1.innerHTML = successMsg;           
        while (newcontent1.firstChild) {
            document.getElementById('results-panel-text').appendChild(newcontent1.firstChild);
        }

        //add the emoji grid to the copy paste box
        let newcontent2 = document.createElement('div');
        newcontent2.innerHTML = getResultString();          
        while (newcontent2.firstChild) {
            document.getElementById('text-display').appendChild(newcontent2.firstChild);
        }
        
        //Color and show the results panel
        document.getElementById('results-panel').style.borderColor = '#428551';
        document.getElementById('results-panel').classList.add('is-open');
        
        //set the final results string - append message below to emojis
        let guessStr = (guesshistory.length>1) ? " guesses" : " guess";
        resultsstring += "HUZZAH! I just solved today\'s Dundle in " + guesshistory.length + guessStr + "!  Can you do better?"
        
        //set the Twitter URL 
        document.getElementById("twitter-button").href="https://twitter.com/intent/tweet?url=https://crithitbrit.ghost.io/dundle&text=" + resultsstringTweet + "%0AHUZZAH!%20I%20just%20solved%20today%27s%20Dundle%20in%20" + guesshistory.length + guessStr + "%21%20%20Can%20you%20do%20better%3F%0A"; 

        setTimeout(function() {
             document.getElementById('results-panel').focus();
        }, 2000);        
        
        return
    } else {
        guessesRemaining -= 1;
        currentGuess = [];
        nextLetter = 0;

        if (guessesRemaining === 0) {
            toastr.error("You've run out of guesses! Game over!")

            //add sorry message to results panel
            let resultsDiv = document.getElementById('results-panel-text');
            let newcontent1 = document.createElement('div');
            let newcontent2 = document.createElement('div');
            newcontent1.innerHTML = `Sorry! The right word was: <i><b>"${rightGuessString}"</b></i>. \n`
            newcontent2.innerHTML = sorryMsg;

            while (newcontent1.firstChild) {
                resultsDiv.appendChild(newcontent1.firstChild);
            }
            while (newcontent2.firstChild) {
                resultsDiv.appendChild(newcontent2.firstChild);
            }

            //add the emoji grid to the copy paste box
            let newcontent3 = document.createElement('div');
            newcontent3.innerHTML = getResultString();       
            while (newcontent3.firstChild) {
                document.getElementById('text-display').appendChild(newcontent3.firstChild);
            }

            //color and Show the results panel
            document.getElementById('results-panel').style.borderColor = '#6e0707';
            document.getElementById('results-panel').classList.add('is-open');

            //set the final results string - append message below to emojis
            let guessStr = (guesshistory.length>1) ? " guesses" : " guess";
            resultsstring += "\nUh oh! I was beaten by today\'s Dundle!  Will you fare better?"

            //set the Twitter URL 
            document.getElementById("twitter-button").href="https://twitter.com/intent/tweet?url=https://crithitbrit.ghost.io/dundle&text=" + resultsstringTweet + 
            "%0AUh%20oh%21%20I%20was%20beaten%20by%20today%27s%20Dundle%21%20%20Will%20you%20fare%20better%3F%0A";
            
            setTimeout(function() {
                 document.getElementById('results-panel').focus();
            }, 2000); 
            
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

function getResultString() { //share() {
    
    for (let i = 0; i < guesshistory.length; i++) { 
        for (let j = 0; j < guesshistory[i].length; j++) {
            resultsstring += convertToEmoji(guesshistory[i][j]); 
            resultsstringTweet += convertToEmoji(guesshistory[i][j]);
        }   
        resultsstring += "\n"; //add carriage return
        resultsstringTweet += "%0A"; //add carriage return URL encoded (for twitter URL param)
    } 
    return(resultsstring);
}

function copyToClipboard(text) {
    var dummy = document.createElement("textarea");
    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
} 
//////////////////////////////////////////////////////////////////
//New sharing functionality to support native device sharing
const shareButton = document.getElementById('share-button');
const closeButton = document.getElementById('close-button');
const sharePanel = document.getElementById('share-popout');
const copyButton = document.getElementById('copy-link');

shareButton.addEventListener('click', event => {
    let isMobile = false; //initiate as false
    // device detection
    if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent) 
        || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) { 
        isMobile = true;
    }
    //attempt native device share if mobile detected
    if (navigator.share && isMobile) { 
    navigator.share({
        title: 'I just played Dundle - a daily word game for DnD geeks', //email: subject
        url: 'https://crithitbrit.ghost.io/dundle', //email: body
        text: resultsstring //email: body
    }).then(() => {
        console.log('Thanks for sharing!');
    })
    .catch(console.error);
    } else {
        sharePanel.classList.add('is-open');
        sharePanel.focus();
    }    
});

closeButton.addEventListener('click', event => {
    sharePanel.classList.remove('is-open');
});

copyButton.addEventListener('click', event => {
    copyToClipboard(resultsstring);
    toastr.success("Your results are copied to clipboard and ready to share!"); 
});
