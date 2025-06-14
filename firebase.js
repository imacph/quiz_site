import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js";

const firebaseConfig = {
    apiKey: "AIzaSyDVDOv9bnLP8kTrpzo9KQzAhmCSWMZeEU0",
    authDomain: "quiz-app-d64f5.firebaseapp.com",
    projectId: "quiz-app-d64f5",
    storageBucket: "quiz-app-d64f5.appspot.com",
    messagingSenderId: "137094184065",
    appId: "1:137094184065:web:928b7ec8d14e8fbe9ee180",
    measurementId: "G-HB3RZKDKZK"
};

export const app = initializeApp(firebaseConfig);