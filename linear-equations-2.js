// for multi-choice quizzes, the entry point to the script is the exported function
// questionGenerator, which should return an object with the question text, choices, and correct answer.


export function questionGenerator() {
    const a = Math.floor(Math.random() * 10) + 1;      // a: 1-5
    const x = Math.floor(Math.random() * 10) + 1;     // x: 1-10
    
    let b = Math.floor(Math.random() * 10) + 1;     // b: 1-10
    while (b >= a*x) {
        b = Math.floor(Math.random() * 10) + 1
    }
    const c = a*x -b;

    const questionText = `Solve for x: ${a}x - ${b} = ${c}`;
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


