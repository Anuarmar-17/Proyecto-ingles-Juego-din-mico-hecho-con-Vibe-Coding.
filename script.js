const words = [
    "issue", "jam", "advice", "spot", "stuck", "problems",
    "chill out", "non sense"
];

let shuffledWords = [];
let currentWord = "";
let scrambled = "";
let score = 0;
let mistakes = 0;
let wordIndex = 0;
let answered = false;
let gameOver = false;

const scrambledWordElement = document.getElementById("scrambled-word");
const guessInput = document.getElementById("guess");
const checkBtn = document.getElementById("check-btn");
const nextBtn = document.getElementById("next-btn");
const feedbackElement = document.getElementById("feedback");
const scoreElement = document.getElementById("score");

// Normalizar texto (quita acentos, signos, puntos, etc.)
const normalize = (s) =>
    s.toLowerCase()
     .normalize('NFD').replace(/\p{M}/gu, '')    // quita acentos
     .replace(/[^\p{L}\d]+/gu, '')               // quita puntuación y espacios extra
     .trim();

// Verificar si el navegador soporta SpeechRecognition
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognition) {
    alert('Tu navegador no soporta el reconocimiento de voz');
} else {
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;

    const micBtn = document.getElementById('mic-btn');
    let isListening = false;

    recognition.onstart = () => { isListening = true; };
    recognition.onend   = () => { isListening = false; };

    // Habilitar el micrófono para escuchar lo que dice el jugador
    micBtn.addEventListener('click', () => {
        if (isListening) recognition.stop();
        recognition.start();
        feedbackElement.textContent = 'Listening...';
        feedbackElement.style.color = 'gray';
    });

    // Cuando se recibe el resultado del reconocimiento de voz
    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        const said = normalize(transcript); // normalizado
        guessInput.value = said;

        feedbackElement.textContent = `You said: ${transcript}`;
        feedbackElement.style.color = 'blue';

        if (said === normalize(currentWord)) {  // compara normalizado
            feedbackElement.textContent = "✅ Correct!";
            feedbackElement.style.color = "green";
            score++;
            scoreElement.textContent = score;
            showGif("correct");
            answered = true;
            checkGameStatus();
        } else {
            feedbackElement.textContent = "❌ Wrong! Try again.";
            feedbackElement.style.color = "red";
            mistakes++;
            mistakesElement.textContent = `Mistakes: ${mistakes}`;
            showGif("wrong");
        }
    };

    recognition.onerror = (event) => {
        console.error('Error de reconocimiento: ', event.error);
        feedbackElement.textContent = `Something went wrong: ${event.error}`;
        feedbackElement.style.color = 'red';
    };
}


const gifsCorrect = ["9kvg7f.webp", "3397c5e0646fab8608be815f35863f1d_w200.gif", "giphy (1).gif", "b5b525642d31fc32571618da55f973e5.gif", "everyone-ive-done-it-gifs-of-the-weird-endings-v0-89c185xi9tme1.gif", "tenor_1.gif", "surprised-andy.webp", "goku_jtbt87nz.gif", "popular-gif.gif", "zootopia.gif"];
const gifsWrong   = ["0224abe935f6a47b7309c36e76e9e77c.gif", "fail-dog.gif", "false.gif", "giphy.gif", "kid-sad.gif", "Diomedes Diaz99.gif", "everyone-ive-done-it-gifs-of-the-weird-endings-v0-wcxthu8i9tme1.gif", "sad-gif-1.gif", "OQIWI4D.gif", "pff-loser.gif", "descarga.gif"];

// 🎨 Color único para score y mistakes
const markerColor = "#222"; 
scoreElement.style.color = markerColor;

// 📌 Contador de errores
const mistakesElement = document.createElement("p");
mistakesElement.id = "mistakes";
mistakesElement.style.fontSize = "1rem";
mistakesElement.style.color = markerColor;
mistakesElement.textContent = "Mistakes: 0";
document.querySelector(".game-container").appendChild(mistakesElement);

// 📌 Mensaje final
const finalMessage = document.createElement("p");
finalMessage.id = "final-message";
finalMessage.style.fontWeight = "bold";
finalMessage.style.fontSize = "1.2rem";
document.querySelector(".game-container").appendChild(finalMessage);

// 📌 Botón reiniciar
const restartBtn = document.createElement("button");
restartBtn.textContent = "Play Again";
restartBtn.style.display = "none";
restartBtn.style.backgroundColor = "#0077cc"; 
restartBtn.style.color = "white";
restartBtn.style.border = "none";
restartBtn.style.borderRadius = "6px";
restartBtn.style.padding = "10px 15px";
restartBtn.style.marginTop = "10px";
restartBtn.style.cursor = "pointer";
restartBtn.style.fontSize = "1rem";
restartBtn.style.transition = "background 0.3s";
restartBtn.style.transform = "scale(1)";
restartBtn.addEventListener("mouseover", () => {
    restartBtn.style.backgroundColor = "#005fa3";
    restartBtn.style.transform = "scale(1.1)";
    restartBtn.style.transition = "0.3s";
});
restartBtn.addEventListener("mouseout", () => {
    restartBtn.style.backgroundColor = "#0077cc";
    restartBtn.style.transform = "scale(1)";
    restartBtn.style.transition = "0.3s";
});
document.querySelector(".game-container").appendChild(restartBtn);

// 🔀 Fisher–Yates shuffle
function fisherYatesShuffle(array) {
    let arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

// Mezcla palabras sin repetir
function scrambleWord(word) {
    let scrambled;
    do {
        scrambled = fisherYatesShuffle(word.split("")).join("");
    } while (scrambled === word);
    return scrambled;
}

function newWord() {
    if (shuffledWords.length === 0 || wordIndex >= shuffledWords.length) {
        shuffledWords = fisherYatesShuffle(words);
        wordIndex = 0;
    }

    currentWord = shuffledWords[wordIndex];
    scrambled = scrambleWord(currentWord);
    scrambledWordElement.textContent = scrambled;
    guessInput.value = "";
    feedbackElement.textContent = "";
    answered = false; 
    wordIndex++;
}

function checkGameStatus() {
    if (score >= 6) {
        endGame("🏆 You win!", "#FFD700");
    } else if (mistakes >= 5) {
        endGame("💩 You lose!", "#CD7F32");
    }
}

function endGame(message, color) {
    finalMessage.textContent = message;
    finalMessage.style.color = color;
    gameOver = true;
    checkBtn.disabled = true;
    nextBtn.disabled = true;
    guessInput.disabled = true;
    restartBtn.style.display = "inline-block";

    if (message.includes("win")) {
        const link = document.createElement("a");
        link.href = "index2.html";
        link.textContent = "Let's go to the level 2 🚀";
        link.target = "_self";
        link.style.display = "block";
        link.style.marginTop = "10px";
        link.style.color = "#1E90FF";
        link.style.fontWeight = "bold";
        link.style.textDecoration = "none";
        link.style.fontSize = "1.1rem";

        if (!document.getElementById("next-level-link")) {
            link.id = "next-level-link";
            document.querySelector(".game-container").appendChild(link);
        }
    }
}

function restartGame() {
    score = 0;
    mistakes = 0;
    wordIndex = 0;
    answered = false;
    gameOver = false;
    scoreElement.textContent = score;
    mistakesElement.textContent = "Mistakes: 0";
    finalMessage.textContent = "";
    checkBtn.disabled = false;
    nextBtn.disabled = false;
    guessInput.disabled = false;
    restartBtn.style.display = "none";
    newWord();
}

function showGif(type) {
    const gifContainer = document.getElementById("gif-container");
    const gif = document.getElementById("feedback-gif");

    let gifList, folder;
    if (type === "correct") {
        gifList = gifsCorrect;
        folder = "./carpeta de gifs/bien/";
    } else {
        gifList = gifsWrong;
        folder = "./carpeta de gifs/mal/";
    }

    const randomGif = gifList[Math.floor(Math.random() * gifList.length)];
    gif.src = folder + randomGif;

    // Mostrar con transición
    gifContainer.classList.add("show");

    // Esperar 5s y luego hacer fade-out
    setTimeout(() => {
        gifContainer.classList.remove("show");
    }, 5000);
}

// ✅ Usar normalize también en el botón Check
checkBtn.addEventListener("click", () => {
    if (answered || gameOver) return; 

    const guess = normalize(guessInput.value);

    if (guess === normalize(currentWord)) {
        feedbackElement.textContent = "✅ Correct!";
        feedbackElement.style.color = "green";
        score++;
        scoreElement.textContent = score;
        showGif("correct");
    } else {
        feedbackElement.textContent = "❌ move on to the next word!";
        feedbackElement.style.color = "red";
        mistakes++;
        mistakesElement.textContent = `Mistakes: ${mistakes}`;
        showGif("wrong");
    }

    answered = true;
    checkGameStatus();
});

nextBtn.addEventListener("click", () => {
    if (!gameOver) {
        newWord();
    }
});

restartBtn.addEventListener("click", restartGame);

newWord();
