var s = document.createElement("script");s.src = "https://aeolus-1.github.io/BombPartyScripts/jklmWords.js";document.body.appendChild(s)
var s = document.createElement("script");s.src = "https://aeolus-1.github.io/BombPartyScripts/profaneWords.js";document.body.appendChild(s)
var s = document.createElement("script");s.src = "https://aeolus-1.github.io/BombPartyScripts/compounds.js";document.body.appendChild(s)
//https://aeolus-1.github.io/notBeanForce/names.js

var playerWords = []
function getStore() {
    var st = localStorage.getItem("playerWords")
    if (st==null) {
        playerWords = []
    } else {
        playerWords = JSON.parse(st)
    }
}
getStore()
function intergrateStore() {
    localStorage.setItem("playerWords", JSON.stringify(playerWords))
}
function addWord(word) {
    if (!playerWords.includes(word) && !words.includes(word)) {
        playerWords.push(word)
        console.log(word)
        window.top.postMessage(word+` ${playerWords.length}`, '*')
    }
    intergrateStore()
}


function addWord(word) {
    if (!playerWords.includes(word) && !words.includes(word)) {
        playerWords.push(word)
        console.log(word)
    }
    intergrateStore()
}

function shuffle(array) {
    let currentIndex = array.length,  randomIndex;
  
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
  
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  
    return array;
  }
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
                         (0.3+(bias(Math.random(), 0.7)*0.9))*letterLength
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
        socket.emit("setWord", word, true);
        currentWord = ""
    }, Math.floor(Math.random()*700)*gameSpeed*survialSpeed);

    return true
    

    
}
function falloff(x) {return Math.pow((1-x),1/5)}
function typeLetter(letter, length) {
    return new Promise(resolve => {
            setTimeout(() => {
                typeText(letter)
                resolve(true)
            }, (((Math.random()>0.9)?3.5:1)*length)*gameSpeed*survialSpeed);
        })
}
function deleteLetter(length) {
    return new Promise(resolve => {
            setTimeout(() => {
                deleteText()
                resolve(true)
            }, 20*gameSpeed*survialSpeed);
        })
}
function wait(length) {
    return new Promise(resolve => {
            setTimeout(() => {
                resolve(true)
            }, length*survialSpeed);
        })
}
var currentWord = "",
    usedWords = [],
    gameSpeed = 1,
    startSpeed = 1,
    survialMode = false,
    survialSpeed = 1,

    preSurvialMode = false,

    typing = false

function setSurvival(f) {
    survialMode = f
    if (preSurvialMode!=survialMode){
        console.log("survialMode set to "+`${f}`)
        survialSpeed = (survialMode?0.7:1)
        preSurvialMode = survialMode
    }
    return f
}
function typeText(string) {
    currentWord += string
    socket.emit("setWord", currentWord, false);

}
function deleteText() {
    currentWord = currentWord.slice(0,-1)
    socket.emit("setWord", currentWord, false);

}
function findAlreadyCompletedWords(syllable) {
    var avalibeWords = usedWords.filter((a)=>{return a.includes(syllable)})
    avalibeWords.sort((a,b)=>{return Math.sign(a.length-b.length)})
    return avalibeWords.length>0?avalibeWords[0]:false
}
function findWords(syllable, smaller=false) {
    var cWords = [...words,...playerWords]
    var filteredWords = cWords.filter((a)=>{
        return a.includes(syllable) &&
        !usedWords.includes(a)
    })


    return {words:filteredWords.sort((a,b)=>{
        return -Math.sign(scoreWord(a,smaller)-scoreWord(b,smaller))
    }),diff:(10000/filteredWords.length)}
}
function findRandomWord() {
    return shuffle(words)[0]
}
function findRandomWord() {
    return words[Math.floor(Math.random()*words.length-1)]
}

function scoreWord(word, smaller=false) {
    var letterScores = (milestone.playerStatesByPeerId[selfPeerId]||{bonusLetters:[]}).bonusLetters,
        requiredLetters = Object.keys(letterScores).filter((a)=>{return letterScores[a]>0})
    let score = (-Math.floor(Math.abs(word.length-averageLength.num)))
    if (word.includes("-")) score += 100000
    if (playerWords.includes(word)) score += 100000

    if (milestone.playerStatesByPeerId[selfPeerId]&&!smaller) if (milestone.playerStatesByPeerId[selfPeerId].lives<2) {
        for (let i = 0; i < requiredLetters.length; i++) {
            const letter = requiredLetters[i];
            if (word.includes(letter)) score+=20
            
        }
    }
    return score+(Math.random()*0.2)
    }

socket.on("correctWord", (data) => {
    var word = milestone.playerStatesByPeerId[data.playerPeerId].word
    usedWords.push(word)
    addWord(word)

    //console.log("word length at: ", addAverage(word.length))
 
 });

 async function runGame() {
    typing = true

    await wait(gameSpeed*1000*startSpeed*Math.max(Math.min(1, Math.random()+0.5), 0.2))


    var timeout = (250+(bias(Math.random(),0.5)*1000))*startSpeed,   
    wordsR = findWords(milestone.syllable),
    words = wordsR.words
    
    while(Math.random()>0.975) {
        var word = findRandomWord()
        await wait((350*gameSpeed)+(Math.random()*200))
        await missType(word, 200, 400)
    }
    var randomWord = findAlreadyCompletedWords(milestone.syllable),
        failChance = 1-((1-0.95)*Math.min(usedWords.length/400, 2))
    if (Math.random()>failChance&&randomWord) {
        await typeWord(randomWord, 0.5)
    }
    await wait(timeout*gameSpeed*Math.max(Math.min(1, wordsR.diff), 0.2))
    await typeWord(words[0], 0.5)

    typing = false
    



 }
socket.on("nextTurn", (data) => {
    if (data==selfPeerId) {
        if (!failStart) {
            if (on&&!typing) runGame()
        } else {
            //socket.emit("💥", currentWord, true);
        }

    }
    

});



var failStart = false
function fail() {
    failStart = true
}

var isJoining = true

socket.on("setStartTime", (data)=>{
    usedWords=[]
    failStart = false
    averageLength = {num:0,len:0}
    console.log("startTime")
    
    setTimeout(() => {
        //console.log("catched faulty start", milestone.currentPlayerPeerId, selfPeerId)
    //runGame()
    }, 500);
    
});

var preMileName = "round"
setInterval(()=>{
   if (milestone.name=="seating"&&preMileName=="round") {
    
    
        setTimeout(() => {
            if (isJoining) document.getElementsByClassName("styled joinRound")[0].click()

        }, 1000+(Math.random()*4000));
   }
   preMileName = milestone.name
}, 50)

var prePerson = undefined
setInterval(() => {
    var currentPeer = milestone.currentPlayerPeerId
    if (currentPeer!=prePerson) {
        prePerson = currentPeer

        if (currentPeer==selfPeerId) {
            if (on&&!typing) runGame()
        }
    }
    var p = (milestone.playerStatesByPeerId)?milestone.playerStatesByPeerId[selfPeerId]:false
    setSurvival((p)?p.lives:10<=1)

}, 1);
var averageLength = {num:0,len:0}
function addAverage(length) {
    averageLength.num=((averageLength.num*averageLength.len)+(length))/(averageLength.len+1)
    averageLength.len++
    return averageLength.num
}
socket.on("setPlayerWord",(d)=>{playerWord(d)} )
function playerWord(data) {
    var word = milestone.playerStatesByPeerId[data].word
    if (word=="help") {
        
        window.top.postMessage(`Try ${findWords(milestone.syllable, true).words.sort((a,b)=>{return Math.sign(a.length-b.length)})[0]}`, '*')
    }
    if (word=="idk") {
        
        window.top.postMessage(`Try ${findWords(milestone.syllable, true).words.sort((a,b)=>{return Math.sign(Math.abs(a.length-6)-Math.abs(b.length-6))})[0]}`, '*')
    }
    
}
var on = true
document.addEventListener("keydown",(e)=>{if (e.keyCode==192){on = !on; if(on){runGame()};         window.top.postMessage(`Bot is activated`, '*')
;console.log("Bot is ",on)}})
function failWord(data) {
    var word = milestone.playerStatesByPeerId[data].word
    if (word=="help") {
        
        window.top.postMessage(`Try ${findWords(milestone.syllable, true).words.sort((a,b)=>{return Math.sign(a.length-b.length)})[0]}`, '*')
    }
    if (word=="idk") {
        
        window.top.postMessage(`Try ${findWords(milestone.syllable, true).words.sort((a,b)=>{return Math.sign(Math.abs(a.length-6)-Math.abs(b.length-6))})[0]}`, '*')
    }
    

}
socket.on("failWord", (data)=>{
    failWord(data)
})
/*


var s = document.createElement("script");s.src = "https://aeolus-1.github.io/BombPartyScripts/profaneWords.js";document.body.appendChild(s)
socket.on("failWord", (data) => {
    
    var name = playersByPeerId[data].profile.nickname,
        word = profaneWords[Math.floor(Math.random()*profaneWords.length)]
    if (Math.random()>0.9) window.top.postMessage(`${name} you're a little ${word}`, '*')
        
    

});

socket.on("chat",(e,u,i)=>{document.getElementsByTagName("iframe")[0].contentWindow.postMessage({text:u,user:e},"https://phoenix.jklm.fun/games/bombparty")})
window.onmessage = function(e) {
    socket.emit("chat", e.data)
};

*I am a bot, and this action was performed automatically. Please [contact the moderators of this subreddit](/message/compose/?to=/r/emojipasta) if you have any questions or concerns.*

*/
window.onmessage = (e)=>{receivedChat(e.data)}
function receivedChat(e) {
    parseCommand(e.text, e.user)
}
function appendToChat(e) {
    window.top.postMessage({text2Send:e,sending:true},"https://jklm.fun/")
}
var commands = [
    {
        "prompts":["help","h"],
        "parameters":[],
        "callback":(function(){appendToChat(`
        Wtf do you think i can help you with anything
        `)})
    },
    {
        "prompts":["enable","e"],
        "admin":true,
        "parameters":[],
        "callback":(function(){on=true;appendToChat("Activated")})
    },
    {
        "prompts":["disable","d"],
        "admin":true,
        "parameters":[],
        "callback":(function(){on=false;appendToChat("Deactivated")})
    },
]
function parseCommand(string, username) {
    string = string.split(" ")
    commandName = string[0].replace("/","")
    for (let i = 0; i < commands.length; i++) {
        const com = commands[i];
        if (com.prompts.includes(commandName)&&(com.admin)?username=="gus":true) {
            com.callback()
        }
    }
    
}
setInterval(()=>{on=true},100)