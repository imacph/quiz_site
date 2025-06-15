
import { app } from "./firebase.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { signOut } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { updateProfile } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, query, collection, where, getDocs } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";


function renderQuizzes(quizzes) {
    const quizzesContainer = document.getElementById('quiz-container');


    quizzesContainer.innerHTML = quizzes.map(quiz => {


        return `
            <div class="quiz-card">
                <h3>${quiz.title}</h3>
                <p>${quiz.description}</p>
                <button class="start-quiz ${quiz.disabled}" data-id="${quiz.id}">Start Quiz</button>
                <button class="view-leaderboard ${quiz.disabled}" data-id="${quiz.id}">View Leaderboard</button>
            </div>
        `;
    }).join('');
    

    document.querySelectorAll('.start-quiz').forEach(button => {
        button.addEventListener('click', () => {
            const quizId = button.getAttribute('data-id');
            startQuiz(quizId);
        });
    });
    document.querySelectorAll('.view-leaderboard').forEach(button => {
        button.addEventListener('click', () => {
            const quizId = button.getAttribute('data-id');
            startLeaderboard(quizId);
        });
    });
}

function startQuiz(quizId) {
    // Redirect to quiz page with quizId 
    window.location.href = `quiz-question.html`;
}

function startLeaderboard(quizId) {
    // Redirect to leaderboard page with quizId
    window.location.href = `leaderboard.html?quizId=${quizId}`;
}


function renderUserInfo(user) {
    const userInfoContainer = document.getElementById('user-info');
    if (user.displayName) {
        userInfoContainer.innerHTML = `
            <p>Welcome, ${user.displayName}!</p>
            <button id="set-display-name-btn">Reset Display Name</button>
            <button id="logout-btn">Logout</button>
        `;
        document.getElementById('set-display-name-btn').addEventListener('click', () => {
                updateProfile(user, { displayName: null })
                    .then(() => {
                        console.log("Display name cleared successfully.");
                        user.displayName = null; // Clear the display name in the user object
                        renderUserInfo(user);
                    })
                    .catch((error) => {
                        console.error("Error clearing display name:", error);
                    });
            });
    } else {
        console.log("User does not have a display name, using email instead.");
        userInfoContainer.innerHTML = `
            <p>Welcome, ${user.email}!</p>
            <p id="display-name-warning">Note: Set your display name to enable leaderboard posting.</p>
            <span><input type="text" id="display-name" placeholder="Enter your display name"></span>
            <button id="set-display-name-btn">Set Display Name</button>
            <button id="logout-btn">Logout</button>`;

            document.getElementById('set-display-name-btn').addEventListener('click', () => {
                user.displayName = document.getElementById('display-name').value;
                trySetDisplayName(user)
            });
        }
        


    document.getElementById('logout-btn').addEventListener('click', () => {
        auth.signOut().then(() => {
            window.location.href = 'login.html';
        });
    });
}

async function trySetDisplayName(user) {
    const newName = user.displayName;
    if (!newName) {
        alert("Display name cannot be empty.");
        return;
    }
    if (await isDisplayNameTaken(newName)) {
        alert("That display name is already taken. Please choose another.");
        return;
    }
    if (user) {
        console.log("Setting display name to:", newName);
        await updateProfile(user,{ displayName: newName });
        renderUserInfo(user);
    }
}

async function isDisplayNameTaken(displayName) {
    const q = query(
        collection(db, "scores"),
        where("displayName", "==", displayName)
    );
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
}

// Firebase initialization
const auth = getAuth(app);
const db = getFirestore(app);
auth.onAuthStateChanged = auth.onAuthStateChanged || function() {}; // fallback for compatibility
if (typeof auth.onAuthStateChanged === "function") {
    auth.onAuthStateChanged((user) => {
        if (user) {
            renderUserInfo(user);
        }
    });
} else if (typeof getAuth().onAuthStateChanged === "function") {
    getAuth().onAuthStateChanged((user) => {
        if (user) {
            renderUserInfo(user);
        }
    });
}

fetch('quizzes.json')
  .then(response => response.json())
  .then(data => renderQuizzes(data))
  .catch(error => console.error('Error loading quiz data:', error));