// quiz-question.js

// Get quizId from URL
const params = new URLSearchParams(window.location.search);
const quizId = params.get('quizId');

function loadQuizScript(quizId, quizzes) {

    let quizType = null;

    quizzes.forEach(quiz => {
        if (quiz.id === quizId) {
            quizType = quiz.type;
        }
    });

    if ((quizType === "multi-choice") && (quizSrc)) {
        
        const script = document.createElement('script');
        script.src = "./multi-choice.js";
        script.type = 'module';
        document.body.appendChild(script);

    } else if (!quizSrc) {
        alert("Quiz script not found.");
        return;
    } else {
        alert("Quiz type not supported or script not found.");
        return;
    }
    
}


fetch('quizzes.json')
  .then(response => response.json())
  .then(data => loadQuizScript(quizId,data))
  .catch(error => console.error('Error loading quiz data:', error));



