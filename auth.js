import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyDVDOv9bnLP8kTrpzo9KQzAhmCSWMZeEU0",
    authDomain: "quiz-app-d64f5.firebaseapp.com",
    projectId: "quiz-app-d64f5",
    storageBucket: "quiz-app-d64f5.firebasestorage.app",
    messagingSenderId: "137094184065",
    appId: "1:137094184065:web:928b7ec8d14e8fbe9ee180",
    measurementId: "G-HB3RZKDKZK"
};

const app = initializeApp(firebaseConfig);
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
    statusText.textContent = "Signed in!";
    await new Promise(resolve => setTimeout(resolve, 300));
    window.location.href = 'index.html';
    } catch (error) {
    statusText.textContent = "Error: " + error.message;
    }
});

signOutBtn.addEventListener("click", async () => {
    await signOut(auth);
    statusText.textContent = "Signed out.";
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