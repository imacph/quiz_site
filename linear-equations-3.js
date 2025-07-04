// for multi-choice quizzes, the entry point to the script is the exported function
// questionGenerator, which should return an object with the question text, choices, and correct answer.


export function questionGenerator() {

    const a = Math.floor(Math.random()*10)+1;
    const x = Math.floor(Math.random()*20) - 10;
    const b = Math.floor(Math.random()*20)-10;
    
    let c  = Math.floor(Math.random()*20)-10;
    while ((Math.abs(a*x + b - c*x) > 14) || (c === a)) {
        c = Math.floor(Math.random()*20) - 10;
    }

    const d = a*x + b - c*x;

    const questionText = `${a}x + ${b} = ${c}x + ${d}`;
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


