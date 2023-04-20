var s = document.createElement("script");s.src = "https://aeolus-1.github.io/BombPartyScripts/jklmWords.js";document.body.appendChild(s)



function bias(t, n) {
	let e = Math.pow(1 - n, 3);
	return (t * e) / (t * e - t + 1);
  }
async function typeSmoothly(word, length) {
    let letterLength = length/word.length
    if (Math.random()>0.98) {
        let word = findRandomWord()
        await missType(word.substr(0, Math.min(word.length-1, 2+Math.floor(Math.random()*2.5))), 150, 400)

    }

    for (let i = 0; i < word.length; i++) {
        let wordPer = i/word.length

        await typeLetter(word[i], 
                         (0.3+(bias(Math.random(), 0.5)*0.7))*letterLength
                         *falloff(wordPer)
                        
                        )

        if (Math.random()>0.97) {
            await missTypeRandomLetters(Math.floor(Math.random()*1.35)+1, 150)
        }
    }
    return "done"

}
async function missTypeRandomLetters(length, letterLength) {
    var letters = "wertyuiopasdfghjklcvbnm"
    function rL() {return letters[Math.floor(Math.random()*letters.length)]}
    var word = ""
    for (let i = 0; i < length; i++) {
        word = word+rL()        
    }
    await missType(word, letterLength)
}
async function missType(word, letterLength, waitLength=40) {
    
    for (let i = 0; i < word.length; i++) {
        await typeLetter(word[i],
        (0.3+(bias(Math.random(), 0.5)*0.7))*letterLength
                         )        
    }
    await wait(waitLength*gameSpeed)
    for (let i = 0; i < word.length; i++) {
        await deleteLetter((0.3+(bias(Math.random(), 0.5)*0.7))*100
        )        
    }

    return "done"
}
async function typeWord(word, typingSpeec) {
    let wordLength = 0.25+(bias(Math.random(),0.6)*0.75)
    await typeSmoothly(word, word.length*500*wordLength*(1/typingSpeec))
    setTimeout(() => {
        socket.emit("setWord", currentWord, true);
        currentWord = ""
    }, Math.floor(Math.random()*300)*gameSpeed);
    

    
}
function falloff(x) {return Math.pow((1-x),1/5)}
function typeLetter(letter, length) {
    return new Promise(resolve => {
            setTimeout(() => {
                typeText(letter)
                resolve(true)
            }, (((Math.random()>0.9)?3.5:1)*length)*gameSpeed);
        })
}
function deleteLetter(length) {
    return new Promise(resolve => {
            setTimeout(() => {
                deleteText()
                resolve(true)
            }, 40*gameSpeed);
        })
}
function wait(length) {
    return new Promise(resolve => {
            setTimeout(() => {
                resolve(true)
            }, length);
        })
}
var currentWord = "",
    usedWords = [],
    gameSpeed = 1,
    startSpeed = 1
function typeText(string) {
    currentWord += string
    socket.emit("setWord", currentWord, false);

}
function deleteText() {
    currentWord = currentWord.slice(0,-1)
    socket.emit("setWord", currentWord, false);

}
function findWords(syllable) {
    var filteredWords = words.filter((a)=>{
        return a.includes(syllable) &&
        !usedWords.includes(a)
    })


    return {words:filteredWords.sort((a,b)=>{
        return -Math.sign(scoreWord(a)-scoreWord(b))
    }),diff:(10000/filteredWords.length)}
}
function findRandomWord() {
    return words[Math.floor(Math.random()*words.length-1)]
}

function scoreWord(word) {
    var letterScores = milestone.playerStatesByPeerId[selfPeerId].bonusLetters,
        requiredLetters = Object.keys(letterScores).filter((a)=>{return letterScores[a]>0})
    let score = -word.length+(Math.random()*0.5)
    if (milestone.playerStatesByPeerId[selfPeerId]) if (milestone.playerStatesByPeerId[selfPeerId].lives<=2) {
        for (let i = 0; i < requiredLetters.length; i++) {
            const letter = requiredLetters[i];
            if (word.includes(letter)) score+=2
            
        }
    }
    return score+(Math.random()*3)+(-1.5)
    }

socket.on("correctWord", (data) => {
    var word = milestone.playerStatesByPeerId[data.playerPeerId].word
    usedWords.push(word)
 
 });

 function runGame() {
     console.log("yay")
    var timeout = (250+(bias(Math.random(),0.5)*1000))*startSpeed,   
    wordsR = findWords(milestone.syllable),
    words = wordsR.words
    console.log(timeout*gameSpeed*Math.max(Math.min(1, wordsR.diff), 0.2))
setTimeout(() => {
    typeWord(words[0], 0.5
        
        )

}, timeout*gameSpeed*Math.max(Math.min(1, wordsR.diff), 0.2));
 }
socket.on("nextTurn", (data) => {
    if (data==selfPeerId) {
        if (!failStart) {
            //runGame()
        } else {
            //socket.emit("💥", currentWord, true);
        }

    }
    

});



var failStart = false
function fail() {
    failStart = true
}

socket.on("setStartTime", (data)=>{
    usedWords=[]
    failStart = false
    setTimeout(() => {
        //console.log("catched faulty start", milestone.currentPlayerPeerId, selfPeerId)
    //runGame()
    }, 500);
    
});

setInterval(()=>{
    var butts = document.getElementsByClassName("styled joinRound")
    if (butts.length>0) setTimeout(() => {
        let butts = document.getElementsByClassName("styled joinRound")
        if (butts.length>0) butts[0].click()
    }, 800);
}, 50)

var prePerson = undefined
setInterval(() => {
    var currentPeer = milestone.currentPlayerPeerId
    if (currentPeer!=prePerson) {
        console.log("change to", currentPeer)
        prePerson = currentPeer

        if (currentPeer==selfPeerId) {
            runGame()
        }
    }
}, 1);



