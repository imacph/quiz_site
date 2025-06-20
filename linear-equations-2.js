
import { app } from "./firebase.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";



function generateLinearEquationQuestion() {
    const a = Math.floor(Math.random() * 10) + 1;      // a: 1-5
    const x = Math.floor(Math.random() * 10) + 1;     // x: 1-10
    const b = Math.floor(Math.random() * 10) + 1;     // b: 1-10
    const c = a*x +b;

    const questionText = `Solve for x: ${a}x + ${b} = ${c}`;
    const correctAnswer = x;

    // Generate the wrong answers
    const choices = new Set();
    choices.add(correctAnswer);
    while (choices.size < 4) {
        const wrong = correctAnswer + Math.floor(Math.random()*11);
        if (wrong !== correctAnswer) choices.add(wrong);
    }

    const shuffledChoices = [...choices].sort(() => Math.random()-0.5);

    return {
        questionText,
        choices: shuffledChoices,
        correctAnswer,
    };

}


function checkLoopCondition() {
    if (totalQuestions >= 10) {
        resetQuiz(false);
    } else {
        displayQuestion();
    }
}

function displayQuestion() {

    
    [questionEl, choicesEl, nextBtn, restartBtn].forEach(el => {
        el.classList.remove('hidden');
    });

    const {questionText,choices,correctAnswer} = generateLinearEquationQuestion();
    let questionStart = performance.now();
    nextBtn.classList.add('hidden');

    if (totalQuestions < 9) {
        nextBtn.textContent = "Next Question";
    } else {
        nextBtn.textContent = "Finish Quiz";
    }
    
    questionEl.textContent = questionText;
    choicesEl.innerHTML = "";

    choicesEl.innerHTML = choices.map(choice => 
        `<button class="choice-btn">${choice}</button>`
    ).join('');

    const choiceButtons = choicesEl.querySelectorAll(".choice-btn");


    choiceButtons.forEach(btn => {
        btn.addEventListener('click',()=>{
            btn.classList.add('chosen');
            nextBtn.classList.remove('hidden');

            
            let questionTime = performance.now() - questionStart;
            let answerFlag = (btn.textContent == correctAnswer);

            if (answerFlag) {
                questionTimes.push(questionTime);
            }
            
            displayScore(answerFlag);

            choiceButtons.forEach(otherBtn=>{
                otherBtn.classList.add('clicked');
                if (Number(otherBtn.textContent) === correctAnswer) {
                    otherBtn.classList.add('correct');
                } else {
                    otherBtn.classList.add('incorrect');
                }
            });
        });
    });

    
}

function displayScore(answerFlag) {

    
    timeDisplayEl.textContent = "";

    if (totalQuestions < 0) {
        restartBtn.classList.add('hidden');
    } else {
        restartBtn.classList.remove('hidden');
    }

    if (questionTimes.length > 0) {
        const totalTime = questionTimes.reduce((acc, time) => acc + time, 0)/1000;
        const averageTime = (totalTime / questionTimes.length).toFixed(2);
        timeDisplayEl.textContent = `Average Time: ${averageTime}s`;
    }

    totalQuestions++;
    if (answerFlag) {
        correctAnswers++;
    }
    
    scoreEl.textContent = `${correctAnswers}/${totalQuestions}`;
}


function resetQuiz(resetButtonClicked) {

    timeDisplayEl.textContent = "";
    scoreEl.textContent = "";
    finalScoreEl.textContent = `Final Score: ${calculateScore()}`;
    startBtn.classList.remove('hidden');
    document.querySelectorAll(".choice-btn").forEach(btn => {
        btn.classList.remove('chosen', 'clicked', 'correct', 'incorrect');
        btn.classList.add('hidden');
    });
    [questionEl, choicesEl, nextBtn, restartBtn].forEach(el => {
        el.classList.add('hidden');
    });
    
    if (!resetButtonClicked) {
        saveScoreAfterQuiz(calculateScore());
    } else {
        console.log("Quiz reset by user. Not saving score.");
    }

    totalQuestions = -1;
    correctAnswers = 0;
    questionTimes = [];

    
}

function calculateScore() {

    if (correctAnswers === 0) {
        return 0.00;
    } else {
        const accuracy = correctAnswers / 10;
        const averageTime = (questionTimes.reduce((acc,time) => acc + time, 0) / questionTimes.length)/1000;


        const score = 100 * accuracy * Math.exp(-averageTime / 10);
        return score.toFixed(2);
    }
}

async function saveScoreAfterQuiz(score) {
    const user = auth.currentUser;
    if (user) {
        try {
            const scoreRef = doc(db, "linear-equations-2", user.uid);
            const docSnap = await getDoc(scoreRef);
            let shouldUpdate = true;
            if (docSnap && docSnap.exists && docSnap.exists()) {
                const data = docSnap.data();
                if (typeof data.score === "number" && data.score >= Number(score) && data.displayName === user.displayName) {
                    shouldUpdate = false;
                }
                if (!user.displayName) {
                    shouldUpdate = false;
                }
            }
            if (shouldUpdate) {
                await setDoc(scoreRef, { 
                    score: Number(score),
                    displayName: user.displayName,
                    userId: user.uid 
                });
                console.log("Score saved!");
            } else {
                console.log("Existing score is higher or equal. Not updating.");
            }
        } catch (error) {
            console.error("Firestore write error:", error);
        }
    } else {
        console.error("No user is signed in.");
    }
}

// Firebase initialization
const auth = getAuth(app);
const db = getFirestore(app);

// Quiz initialization
let totalQuestions = -1;
let correctAnswers = 0;
let questionTimes = [];
const scoreEl = document.getElementById("score-display");
const timeDisplayEl = document.getElementById("time-display");
const finalScoreEl = document.getElementById("final-score-display");
const startBtn = document.getElementById("start-btn");
startBtn.addEventListener("click", () => {
    startBtn.classList.add('hidden');
    finalScoreEl.textContent = "";
    displayQuestion();
    displayScore(false);
});

const restartBtn = document.getElementById("restart-btn");
const questionEl = document.getElementById("question");
const choicesEl = document.getElementById("choices");
const nextBtn = document.getElementById("next-btn");

[questionEl, choicesEl, nextBtn, restartBtn].forEach(el => {
    el.classList.add('hidden');
});

document.getElementById("next-btn").addEventListener("click",checkLoopCondition);
document.getElementById("restart-btn").addEventListener("click", () => resetQuiz(true));
document.getElementById("dashboard-btn").addEventListener("click", () => {
    window.location.href = 'dashboard.html';
});
document.getElementById("leaderboard-btn").addEventListener("click", () => {
    window.location.href = 'leaderboard.html?quizId=linear-equations-2';
});