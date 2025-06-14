import { app } from "./firebase.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";
import {
    getFirestore,
    doc,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

const auth = getAuth(app);

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const signUpBtn = document.getElementById("signUpBtn");
const signInBtn = document.getElementById("signInBtn");
const signOutBtn = document.getElementById("signOutBtn");
const statusText = document.getElementById("status");

signUpBtn.addEventListener("click", async () => {
    try {
    await createUserWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
    statusText.textContent = "Sign-up successful!";
    } catch (error) {
    statusText.textContent = "Error: " + error.message;
    }
});

signInBtn.addEventListener("click", async () => {
    try {
        await signInWithEmailAndPassword(auth, emailInput.value, passwordInput.value);
        statusText.textContent = "Signed in!"

        await new Promise(resolve => setTimeout(resolve, 300));
        window.location.href = 'quiz-question.html';
    } catch (error) {
        statusText.textContent = "Error: " + error.message;
    }
});

signOutBtn.addEventListener("click", async () => {
    try {
        await signOut(auth);
        statusText.textContent = "Signed out.";
    } catch (error) {
        statusText.textContent = "Error: " + error.message;
    }
});

onAuthStateChanged(auth, user => {
    if (user) {
    statusText.textContent = `Logged in as ${user.email}`;
    signOutBtn.style.display = "inline";
    } else {
    statusText.textContent = "Not logged in";
    signOutBtn.style.display = "none";
    }
});

