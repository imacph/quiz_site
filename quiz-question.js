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

    questionEl.textContent = questionText;
    choicesEl.innerHTML = "";

    choicesEl.innerHTML = choices.map(choice => {
        if (choice === correctAnswer) {
            return`<button class="choice-btn correct">${choice}</button>`;
        } else {
            return`<button class="choice-btn incorrect">${choice}</button>`;
        }
        
    }).join('');

    const choiceButtons = choicesEl.querySelectorAll(".choice-btn");


    choiceButtons.forEach(btn => {
        btn.addEventListener('click',()=>{
            btn.classList.add('chosen');
            choiceButtons.forEach(otherBtn=>{
                otherBtn.classList.add('clicked');
            });
        });
    });

    
}


document.getElementById("next-btn").addEventListener("click",displayQuestion);
displayQuestion();