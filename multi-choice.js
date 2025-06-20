import { app } from "./firebase.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
const auth = getAuth(app);
const db = getFirestore(app);
const params = new URLSearchParams(window.location.search);
const quizId = params.get('quizId');

class QuizState {
  constructor(questionGenerator) {
    this.totalQuestions = -1;
    this.correctAnswers = 0;
    this.questionTimes = [];
    this.questionGenerator = questionGenerator;
    // Add other properties as needed


  }

  incrementQuestions() {
    this.totalQuestions++;
  }

  addCorrectAnswer() {
    this.correctAnswers++;
  }

  addQuestionTime(time) {
    this.questionTimes.push(time);
  }

  // Add more methods as needed
}

class QuizUI {
    constructor(quizState) {
        this.quizState = quizState;
        
        const pageElements = this.initializePageElements();
        // Destructure the page elements for easier access
        const { 
            scoreEl, 
            timeDisplayEl, 
            finalScoreEl, 
            startBtn, 
            questionEl, 
            choicesEl, 
            nextBtn, 
            restartBtn 
            } = pageElements;

        this.scoreEl = scoreEl;
        this.timeDisplayEl = timeDisplayEl;
        this.finalScoreEl = finalScoreEl;
        this.startBtn = startBtn;
        this.questionEl = questionEl;
        this.choicesEl = choicesEl;
        this.nextBtn = nextBtn;
        this.restartBtn = restartBtn;

        // Add event listeners to buttons
        this.startBtn.addEventListener("click", () => {
            this.startBtn.classList.add('hidden');
            this.finalScoreEl.textContent = "";
            this.displayQuestion();
            this.displayScore(false);
        });

            nextBtn.addEventListener("click", () => {
            checkLoopCondition(quizState,{ scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn });
        });
            restartBtn.addEventListener("click", () => resetQuiz(quizState,true,{ scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn }));
    }
    
    initializePageElements() {

        const scoreEl = document.getElementById("score-display");
        const timeDisplayEl = document.getElementById("time-display");
        const finalScoreEl = document.getElementById("final-score-display");
        const questionEl = document.getElementById("question");
        const choicesEl = document.getElementById("choices");


        const startBtn = document.getElementById("start-btn");
        const restartBtn = document.getElementById("restart-btn");
        const nextBtn = document.getElementById("next-btn");
        
        // Hide certain elements initially
        [questionEl, choicesEl, nextBtn, restartBtn].forEach(el => {
            el.classList.add('hidden');
        });

        document.getElementById("dashboard-btn").addEventListener("click", () => {
            window.location.href = 'dashboard.html';
        });
        document.getElementById("leaderboard-btn").addEventListener("click", () => {
            window.location.href = `leaderboard.html?quizId=${quizId}`;
        });

        

        return {
            scoreEl,
            timeDisplayEl,
            finalScoreEl,
            startBtn,
            restartBtn,
            questionEl,
            choicesEl,
            nextBtn
        }
    }
}

function checkLoopCondition(quizState,pageElements) {

    if (quizState.totalQuestions >= 10) {
        resetQuiz(quizState,false,pageElements);
    } else {
        displayQuestion(quizState,pageElements);
    }
}

function displayQuestion(quizState,pageElements) {

    const { scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn } = pageElements;

    [questionEl, choicesEl, nextBtn, restartBtn].forEach(el => {
        el.classList.remove('hidden');
    });

    const {questionText,choices,correctAnswer} = quizState.questionGenerator();
    let questionStart = performance.now();
    nextBtn.classList.add('hidden');

    if (quizState.totalQuestions < 9) {
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
            let answerFlag = (Number(btn.textContent) === correctAnswer);

            if (answerFlag) {
                quizState.questionTimes.push(questionTime);
            }
            
            displayScore(quizState,answerFlag,pageElements);

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

function displayScore(quizState,answerFlag,pageElements) {

    const { scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn }= pageElements;

    timeDisplayEl.textContent = "";

    if (quizState.totalQuestions < 0) {
        restartBtn.classList.add('hidden');
    } else {
        restartBtn.classList.remove('hidden');
    }

    if (quizState.questionTimes.length > 0) {
        const totalTime = quizState.questionTimes.reduce((acc, time) => acc + time, 0)/1000;
        const averageTime = (totalTime / quizState.questionTimes.length).toFixed(2);
        timeDisplayEl.textContent = `Average Time: ${averageTime}s`;
    }

    quizState.incrementQuestions();
    if (answerFlag) {
        quizState.addCorrectAnswer();
    }
    
    scoreEl.textContent = `${quizState.correctAnswers}/${quizState.totalQuestions}`;
}

function resetQuiz(quizState,resetButtonClicked,pageElements) {

    const { scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn } = pageElements;

    timeDisplayEl.textContent = "";
    scoreEl.textContent = "";
    finalScoreEl.textContent = `Final Score: ${calculateScore(quizState)}`;
    startBtn.classList.remove('hidden');

    document.querySelectorAll(".choice-btn").forEach(btn => {
        btn.classList.remove('chosen', 'clicked', 'correct', 'incorrect');
        btn.classList.add('hidden');
    });

    [questionEl, choicesEl, nextBtn, restartBtn].forEach(el => {
        el.classList.add('hidden');
    });
    
    if (!resetButtonClicked) {
        saveScoreAfterQuiz(calculateScore(quizState));
    } else {
        console.log("Quiz reset by user. Not saving score.");
    }

    quizState.totalQuestions = -1;
    quizState.correctAnswers = 0;
    quizState.questionTimes = [];

    
}


async function saveScoreAfterQuiz(score) {

    const user = auth.currentUser;
    console.log("Saving score:", score, "for user:", user ? user.uid : "No user");
    if (user) {
        try {
            const scoreRef = doc(db, "scores", `${user.uid}_${quizId}`);
            const docSnap = await getDoc(scoreRef);
            let shouldUpdate = true;
            if (docSnap && docSnap.exists()) {
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
                    userId: user.uid,
                    quizId: quizId
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

function calculateScore(quizState) {

    if (quizState.correctAnswers === 0) {
        return 0.00;
    } else {
        const accuracy = quizState.correctAnswers / 10;
        const averageTime = (quizState.questionTimes.reduce((acc,time) => acc + time, 0) / quizState.questionTimes.length)/1000;


        const score = 100 * accuracy * Math.exp(-averageTime / 10);
        return score.toFixed(2);
    }
}


function initializePageElements() {

    const scoreEl = document.getElementById("score-display");
    const timeDisplayEl = document.getElementById("time-display");
    const finalScoreEl = document.getElementById("final-score-display");
    const questionEl = document.getElementById("question");
    const choicesEl = document.getElementById("choices");


    const startBtn = document.getElementById("start-btn");
    

    const restartBtn = document.getElementById("restart-btn");

    const nextBtn = document.getElementById("next-btn");

    // Hide certain elements initially
    [questionEl, choicesEl, nextBtn, restartBtn].forEach(el => {
        el.classList.add('hidden');
    });

    document.getElementById("dashboard-btn").addEventListener("click", () => {
        window.location.href = 'dashboard.html';
    });
    document.getElementById("leaderboard-btn").addEventListener("click", () => {
        window.location.href = `leaderboard.html?quizId=${quizId}`;
    });

    return {
        scoreEl,
        timeDisplayEl,
        finalScoreEl,
        startBtn,
        restartBtn,
        questionEl,
        choicesEl,
        nextBtn
    }
}

function startQuiz(quizzes) {



    let quizScriptSrc = null;
    quizzes.map(quiz => {
        if (quiz.id === quizId) {
            quizScriptSrc = quiz.script;
        }
    });

    import(quizScriptSrc).then(module => {
        
        const quizState = new QuizState(module.questionGenerator);
        // Initialize page elements and buttons
        const {
            scoreEl, timeDisplayEl, 
            finalScoreEl, startBtn, 
            restartBtn, questionEl, 
            choicesEl, nextBtn
        } = initializePageElements();

        // Add event listeners to buttons
        startBtn.addEventListener("click", () => {
            startBtn.classList.add('hidden');
            finalScoreEl.textContent = "";
            displayQuestion(quizState,{ scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn });
            displayScore(quizState,false,{ scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn });
        });

            nextBtn.addEventListener("click", () => {
            checkLoopCondition(quizState,{ scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn });
        });
            restartBtn.addEventListener("click", () => resetQuiz(quizState,true,{ scoreEl, timeDisplayEl, finalScoreEl, startBtn, questionEl, choicesEl, nextBtn, restartBtn }));
        }).catch(error => {
            console.error("Failed to load quiz script:", error);
    });
}




fetch('quizzes.json')
  .then(response => response.json())
  .then(data => startQuiz(data))
  .catch(error => console.error('Error loading quiz data:', error));

