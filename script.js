import { WORDS } from "https://jtathev.github.io/words.js";
import { SUCCESS_WORDS } from "https://jtathev.github.io/success.js";
import { SORRY_WORDS } from "https://jtathev.github.io/sorry.js";

const NUMBER_OF_GUESSES = 6;
let guessesRemaining = NUMBER_OF_GUESSES;
let currentGuess = [];
let guesshistory = [];

let nextLetter = 0;
let dateNowLocal = new Date();
let todayUTC = new Date( Date.UTC(dateNowLocal.getUTCFullYear(), dateNowLocal.getUTCMonth(), dateNowLocal.getUTCDate(), 0, 0, 0));
let indexToday = getIndexFromDate(todayUTC);
let rightGuessString = WORDS[indexToday][0];
let successMsg = SUCCESS_WORDS[Math.floor(Math.random() * SUCCESS_WORDS.length)];
let sorryMsg = SORRY_WORDS[Math.floor(Math.random() * SORRY_WORDS.length)];
let resultsstring = "";
let resultsstringTweet = "";
let hintAdded = false;

const hint = WORDS[indexToday][1];  // '\\?:-,!\'';
const answerDescr = WORDS[indexToday][3];

//Params to store/retrieve local save data
var LAST_SAVE_POINT = 'LastSavePoint';
var LAST_RIGHT_GUESS = 'LastRightGuess'
var currentAnswerArray = [];

var isSavedData = false;
var localAnswerArray = JSON.parse(localStorage.getItem(LAST_SAVE_POINT));
var localRightGuessString = JSON.parse(localStorage.getItem(LAST_RIGHT_GUESS));

if(localAnswerArray != 'undefined' && localAnswerArray != null && localAnswerArray.length > 0 && localRightGuessString.toUpperCase() === rightGuessString.toUpperCase()) {
    isSavedData = true;
}
console.log(rightGuessString)


function initBoard(){ 
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
toastr.options.extendedTimeOut = 1000;
toastr.options.timeOut = 5000; 

if(isSavedData){
    for (let i = 0; i < localAnswerArray.length; i++) {
        for (let j = 0; j < 5; j++){
            let letter1 = String(localAnswerArray[i][j]).toLowerCase();
            currentGuess[j] = letter1;       
            insertLetter(letter1);
        }
        checkGuess();
    }isSavedData = false;
}

function save(saveArray,rightGuess) {
    localStorage.setItem(LAST_SAVE_POINT, JSON.stringify(saveArray));
    localStorage.setItem(LAST_RIGHT_GUESS, JSON.stringify(rightGuess));
}

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
        checkGuess(isSavedData)
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
    if(!isSavedData){animateCSS(box, "pulse")}    
    box.textContent = pressedKey
    box.classList.add("filled-box")
    if(!isSavedData){currentGuess.push(pressedKey)}
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
function checkGuess () {//isSaved) {
    let row = document.getElementsByClassName("letter-row")[6 - guessesRemaining]
    let guessString = ''
    let rightGuess = Array.from(rightGuessString)  
    let currentGuessTracker = [...currentGuess] //copy of guess to manipulate to assist tracking during multi-same letter checking
    
    //create a string value from the currentGuess letter array
    for (const val of currentGuess) {
        guessString += val
    }

    if (guessString.length != 5) {
        toastr.error("Not enough letters!");
        return
    }
    
    //check if word is in the list
    let exists;
    WORDS.forEach(x => {
      if (x.includes(guessString)) exists = true; 
    });

    if (!exists) {
        toastr.error("Word not found in list!");
        return
    }

    //guess is long enough and in list - add an empty row in guesshistory to be updated below
    guesshistory.push([0, 0, 0, 0, 0]);
    currentAnswerArray.push(["","","","",""]);
    
    for (let i = 0; i < 5; i++) {
        let letterColor = ''
        let box = row.children[i]
        let letter = currentGuess[i]
        currentAnswerArray[6-guessesRemaining][i] = letter;
        let letterPosition = rightGuess.indexOf(currentGuess[i])
        
        //method to count occurances of a value within an array
        const countOccurrences = (arr, val) => arr.reduce((a, v) => (v === val ? a + 1 : a), 0);
        let clearRightGuessLetter = true;
        
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
                
                //if there is another of the same letter to come AND there are more of same letter remaining to the right than in the total in correct answer, then set this one to grey
                if(countOccurrences(Array.from(rightGuessString), currentGuess[i] ) < countOccurrences(currentGuessTracker, currentGuess[i] ) && currentGuess.lastIndexOf(currentGuess[i])>i){ 
                    //blank out the repeating letter so not double counted next iteration in if condition above
                    currentGuessTracker[i] = "#"   
                    letterColor = 'grey'
                    clearRightGuessLetter = false;
                }
               
            }

            //blank out the correct letter from right guess (unless suppressed from above) so no checked for again
            if(clearRightGuessLetter){
                rightGuess[letterPosition] = "#"
                clearRightGuessLetter = true;
            }   
            
        }

        let delay = 250 * i
        setTimeout(()=> {
            //flip box
            animateCSS(box, 'flipInX')
            //shade box
            box.style.backgroundColor = letterColor
            shadeKeyBoard(letter, letterColor)
        }, delay)
        
        save(currentAnswerArray,rightGuessString);
    }

    if (guessString === rightGuessString) {
        toastr.success("Huzzah! You guessed right!")
        guessesRemaining = 0

        //add success message to results panel
        let newcontent1 = document.createElement('div');
        newcontent1.innerHTML = successMsg;  
        let newcontent4 = document.createElement('div');
        newcontent4.innerHTML = answerDescr;   
        while (newcontent1.firstChild) {
            document.getElementById('results-panel-text').appendChild(newcontent1.firstChild);
        }
        let resPanelDescr = document.getElementById('results-panel-descr');
        while (newcontent4.firstChild) {
            resPanelDescr.appendChild(newcontent4.firstChild);
            resPanelDescr.classList.add('results-panel-descr');
            resPanelDescr.style.color = "#428551";   
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
        document.getElementById("twitter-button").href="https://twitter.com/intent/tweet?url=https://www.crithitbrit.com/dundle&text=" + resultsstringTweet + "%0AHUZZAH!%20I%20just%20solved%20today%27s%20Dundle%20in%20" + guesshistory.length + guessStr + "%21%20%20Can%20you%20do%20better%3F%0A"; 

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
            let newcontent4 = document.createElement('div');
            newcontent1.innerHTML = `Sorry! The right word was: <i><b>"${rightGuessString}"</b></i>. \n`
            newcontent2.innerHTML = '\n' + sorryMsg;
            newcontent4.innerHTML = answerDescr + ". ";

            while (newcontent1.firstChild) {
                resultsDiv.appendChild(newcontent1.firstChild);
            }           
            while (newcontent2.firstChild) {
                resultsDiv.appendChild(newcontent2.firstChild);
            }
            let resPanelDescr = document.getElementById('results-panel-descr');
            while (newcontent4.firstChild) {
                resPanelDescr.appendChild(newcontent4.firstChild);
                resPanelDescr.classList.add('results-panel-descr');
                resPanelDescr.style.color = "#6e0707";   
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
            document.getElementById("twitter-button").href="https://twitter.com/intent/tweet?url=https://www.crithitbrit.com/dundle&text=" + resultsstringTweet + 
            "%0AUh%20oh%21%20I%20was%20beaten%20by%20today%27s%20Dundle%21%20%20Will%20you%20fare%20better%3F%0A";
            
            setTimeout(function() {
                 document.getElementById('results-panel').focus();
            }, 2000); 
            
        }
    }
    //show hint button if on last guess
    if(guessesRemaining===1 && hint!=''){ 
        document.getElementById('hint-button').classList.add("wobbling-rainbow"); 
        let hintButton = document.getElementById('hint-area');
        hintButton.classList.remove('hidden');
        hintButton.classList.add('is-open'); 
    }
}

const hintButton = document.getElementById('hint-button');
hintButton.addEventListener('click', event => {
    let hintPanel = document.getElementById('hint-popout');
    hintPanel.classList.remove('hidden');
    hintPanel.classList.add('is-open'); 

    //add hint if not already
    if(!hintAdded){ 
        let newcontent1 = document.createElement('div');
        newcontent1.innerHTML = hint;           
        while (newcontent1.firstChild) {
            hintPanel.appendChild(newcontent1.firstChild);
            hintAdded = true;
        }
    }
    hintPanel.focus();
});

//close hint
const closeButton2 = document.getElementById('close-button2');
closeButton2.addEventListener('click', event => {
    document.getElementById('hint-popout').classList.remove('is-open');
});

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
        url: 'https://www.crithitbrit.com/dundle', //email: body
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

function getIndexFromDate(dateIn) {
    let len = WORDS.length;
    let index = ( dateIn.getTime()  / 86400000 ) - 19130; //19130 is days since 1/1/1970 on Dundle day 1! 86400000 is ms in 24h
    let adjIndex = (index>=len) ? index-(len*(Math.floor(index/len))) : index; 
    return adjIndex
}