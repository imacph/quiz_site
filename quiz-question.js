function generateLinearEquationQuestion() {
    const a = Math.floor(Math.random()*10)+1;
    const x = Math.floor(Math.random()*20) - 10;
    const b = Math.floor(Math.random()*20)-10;
    const c = a*x +b;

    const questionText = `Solve for x: ${a}x + ${b} = ${c}`;
    const correctAnswer = x;

    // Generate the wrong answers
    const choices = new Set();
    choices.add(correctAnswer);
    while (choices.size < 4) {
        const wrong = correctAnswer + Math.floor(Math.random()*11) - 5;
        if (wrong !== correctAnswer) choices.add(wrong);
    }

    const shuffledChoices = [...choices].sort(() => Math.random()-0.5);

    return {
        questionText,
        choices: shuffledChoices,
        correctAnswer,
    };

}

function displayQuestion() {

    const {questionText,choices,correctAnswer} = generateLinearEquationQuestion();
    const questionEl = document.getElementById("question");
    const choicesEl = document.getElementById("choices");
    const nextBtn = document.getElementById("next-btn");
    let questionStart = performance.now();
    nextBtn.classList.add('hidden');
    
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

    const restartBtn = document.getElementById("restart-btn");
    const timeDisplayEl = document.getElementById("time-display");
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
    const scoreEl = document.getElementById("score-display");
    scoreEl.textContent = `${correctAnswers}/${totalQuestions}`;
}


function resetQuiz() {
    saveScoreAfterQuiz(correctAnswers/totalQuestions);
    totalQuestions = -1;
    correctAnswers = 0;
    questionTimes = [];
    displayQuestion();
    displayScore(false);
}

import { app } from "./firebase.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

async function saveScoreAfterQuiz(score) {
  const user = auth.currentUser;
  if (user) {
    try {
      await setDoc(doc(db, "scores", user.uid), {score});
      console.log("Score saved!");
    } catch (error) {
      console.error("Firestore write error:", error);
    }
  } else {
    console.error("No user is signed in.");
  }
}

let totalQuestions = -1;
let correctAnswers = 0;
let questionTimes = [];
document.getElementById("next-btn").addEventListener("click",displayQuestion);
displayQuestion();
displayScore(false);

document.getElementById("restart-btn").addEventListener("click",resetQuiz);