import { app } from "./firebase.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";
const auth = getAuth(app);
const db = getFirestore(app);
const params = new URLSearchParams(window.location.search);
const quizId = params.get('quizId');

class QuizState {
    constructor(questionGenerator) {
        this.resetQuizState();
        this.questionGenerator = questionGenerator;
        // Add other properties as needed


    }
    resetQuizState() {
        this.totalQuestions = -1;
        this.correctAnswers = 0;
        this.questionTimes = [];
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
            this.checkLoopCondition();
        });
            restartBtn.addEventListener("click", () => this.resetQuiz(true));
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

    displayQuestion() {

    
        [this.questionEl, this.choicesEl, this.restartBtn].forEach(el => {
            el.classList.remove('hidden');
        });

        const {questionText,choices,correctAnswer} = this.quizState.questionGenerator();

        let questionStart = performance.now();
        this.nextBtn.classList.add('hidden');

        if (this.quizState.totalQuestions < 9) {
            this.nextBtn.textContent = "Next Question";
        } else {
            this.nextBtn.textContent = "Finish Quiz";
        }
        
        this.questionEl.textContent = questionText;

        this.choicesEl.innerHTML = "";
        this.choicesEl.innerHTML = choices.map(choice => 
            `<button class="choice-btn">${choice}</button>`
        ).join('');


        const choiceButtons = this.choicesEl.querySelectorAll(".choice-btn");


        choiceButtons.forEach(btn => {
            btn.addEventListener('click',()=>{
                btn.classList.add('chosen');
                this.nextBtn.classList.remove('hidden');

                
                let questionTime = performance.now() - questionStart;
                let answerFlag = (Number(btn.textContent) === correctAnswer);

                if (answerFlag) {
                    this.quizState.questionTimes.push(questionTime);
                }
                
                this.displayScore(answerFlag);

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

    displayScore(answerFlag) { 

        this.timeDisplayEl.textContent = "";

        if (this.quizState.totalQuestions < 0) {
            this.restartBtn.classList.add('hidden');
        } else {
            this.restartBtn.classList.remove('hidden');
        }

        if (this.quizState.questionTimes.length > 0) {
            const totalTime = this.quizState.questionTimes.reduce((acc, time) => acc + time, 0)/1000;
            const averageTime = (totalTime / this.quizState.questionTimes.length).toFixed(2);
            this.timeDisplayEl.textContent = `Average Time: ${averageTime}s`;
        }

        this.quizState.incrementQuestions();
        if (answerFlag) {
            this.quizState.addCorrectAnswer();
        }
        
        this.scoreEl.textContent = `${this.quizState.correctAnswers}/${this.quizState.totalQuestions}`;
    }

    checkLoopCondition() {

        if (this.quizState.totalQuestions >= 10) {
            this.resetQuiz(false);
        } else {
            this.displayQuestion();
        }
    }

    resetQuiz(resetButtonClicked) {


        this.timeDisplayEl.textContent = "";
        this.scoreEl.textContent = "";
        this.finalScoreEl.textContent = `Final Score: ${this.calculateScore(this.quizState)}`;
        this.startBtn.classList.remove('hidden');

        document.querySelectorAll(".choice-btn").forEach(btn => {
            btn.classList.remove('chosen', 'clicked', 'correct', 'incorrect');
            btn.classList.add('hidden');
        });

        [this.questionEl, this.choicesEl, this.nextBtn, this.restartBtn].forEach(el => {
            el.classList.add('hidden');
        });
        
        if (!resetButtonClicked) {
            saveScoreAfterQuiz(this.calculateScore(this.quizState));
        } else {
            console.log("Quiz reset by user. Not saving score.");
        }

    
        this.quizState.resetQuizState();
    
    }

    calculateScore() {

        if (this.quizState.correctAnswers === 0) {
            return 0.00;
        } else {
            const accuracy = this.quizState.correctAnswers / 10;
            const averageTime = (this.quizState.questionTimes.reduce((acc,time) => acc + time, 0) / this.quizState.questionTimes.length)/1000;


            const score = 100 * accuracy * Math.exp(-averageTime / 10);
            return score.toFixed(2);
        }
    }



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




function startQuiz(quizzes) {



    let quizScriptSrc = null;
    quizzes.map(quiz => {
        if (quiz.id === quizId) {
            quizScriptSrc = quiz.script;
        }
    });

    import(quizScriptSrc).then(module => {
        
        const quizState = new QuizState(module.questionGenerator);

        const quizUI = new QuizUI(quizState);

        }).catch(error => {
            console.error("Failed to load quiz script:", error);
    });
}




fetch('quizzes.json')
  .then(response => response.json())
  .then(data => startQuiz(data))
  .catch(error => console.error('Error loading quiz data:', error));

