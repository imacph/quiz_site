// quiz-question.js

// Get quizId from URL
const params = new URLSearchParams(window.location.search);
const quizId = params.get('quizId');

function loadQuizScript(quizId) {
  const quizScripts = {
    "linear-equations-1": "./linear-equations-1.js",
    // ...other quizzes
  };
  const scriptSrc = quizScripts[quizId];
  if (!scriptSrc) {
    alert("Quiz not found.");
    return;
  }
  const script = document.createElement('script');
  script.src = scriptSrc;
  script.type = 'module';
  document.body.appendChild(script);
}

loadQuizScript(quizId);