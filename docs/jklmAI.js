var s = document.createElement("script");s.src = "https://aeolus-1.github.io/BombPartyScripts/jklmWords.js";document.body.appendChild(s)



function bias(t, n) {
	let e = Math.pow(1 - n, 3);
	return (t * e) / (t * e - t + 1);
  }
async function typeSmoothly(word, length) {
    for (let i = 0; i < word.length; i++) {
        let letterLength = length/word.length,
            wordPer = i/word.length
        await typeLetter(word[i], 
                         (0.3+(bias(Math.random(), 0.5)*0.7))*letterLength
                         *falloff(wordPer)
                        
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
var currentWord = "",
    usedWords = [],
    gameSpeed = 1
function typeText(string) {
    currentWord += string
    socket.emit("setWord", currentWord, false);

}
function findWords(syllable) {
    var filteredWords = words.filter((a)=>{
        return a.includes(syllable) &&
        !usedWords.includes(a)
    })

    return filteredWords.sort((a,b)=>{
        return -Math.sign(scoreWord(a)-scoreWord(b))
    })
}
function scoreWord(word) {
    var letterScores = milestone.playerStatesByPeerId[selfPeerId].bonusLetters,
        requiredLetters = Object.keys(letterScores).filter((a)=>{return letterScores[a]>0})
    let score = 0
    for (let i = 0; i < requiredLetters.length; i++) {
        const letter = requiredLetters[i];
        if (word.includes(letter)) score++
    }
    return score
    }

socket.on("correctWord", (data) => {
    var word = milestone.playerStatesByPeerId[data.playerPeerId].word
    usedWords.push(word)
 
 });

 function runGame() {
    var timeout = 500+(bias(Math.random(),0.5)*1500),   
    words = findWords(milestone.syllable)
setTimeout(() => {
    typeWord(words[0], 0.5)

}, timeout*gameSpeed);
 }
socket.on("nextTurn", (data) => {
    if (data==selfPeerId) {
        runGame()

    }
    

});

socket.on("setStartTime", (data)=>{
    usedWords=[]
    setTimeout(() => {
        //console.log("catched faulty start", milestone.currentPlayerPeerId, selfPeerId)
    //runGame()
    }, 500);
    
});

setInterval(()=>{
    var butts = document.getElementsByClassName("styled joinRound")
    if (butts.length>0) butts[0].click()
}, 5980)





