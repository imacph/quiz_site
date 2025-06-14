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


            let answerFlag = (btn.textContent == correctAnswer);
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
    if (totalQuestions < 0) {
        restartBtn.classList.add('hidden');
    } else {
        restartBtn.classList.remove('hidden');
    }

    totalQuestions++;
    if (answerFlag) {
        correctAnswers++;
    }
    const scoreEl = document.getElementById("score-display");
    scoreEl.textContent = `${correctAnswers}/${totalQuestions}`;
}


function resetQuiz() {
    totalQuestions = -1;
    correctAnswers = 0;
    displayQuestion();
    displayScore(false);
}

let totalQuestions = -1;
let correctAnswers = 0;

document.getElementById("next-btn").addEventListener("click",displayQuestion);
displayQuestion();
displayScore(false);

document.getElementById("restart-btn").addEventListener("click",resetQuiz);