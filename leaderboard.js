import { app } from "./firebase.js";
import { getFirestore, collection,query,orderBy,limit,getDocs } from "https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js";

async function displayLeaderboard(quizId) {
    // This function would typically fetch and display the leaderboard data for the given quiz ID.
    
    if (quizId === "linear-equations-1") {

        const leaderboardBody = document.getElementById("leaderboard-body");
        leaderboardBody.innerHTML = "<tr><td colspan='3'>Loading...</td></tr>";

        const q = query(
            collection(db,"scores"),
            orderBy("score", "desc"),
            limit(10)
        );

        const querySnapshot = await getDocs(q);

        let rows = "";
        let rank = 1;
        querySnapshot.forEach(doc => {
            const data = doc.data();
            // Use data.username if available, otherwise fallback to doc.id
            const name = data.displayName || doc.id;
            rows += `
                <tr>
                    <td>${rank}</td>
                    <td>${name}</td>
                    <td>${data.score}</td>
                </tr>
            `;
            rank++;
        });

        leaderboardBody.innerHTML = rows || "<tr><td colspan='3'>No scores found.</td></tr>";
            
    }
}


const db = getFirestore(app);
const params = new URLSearchParams(window.location.search);
const quizId = params.get('quizId');


console.log('Quiz ID:', quizId);

displayLeaderboard(quizId);

document.getElementById("dashboard-btn").addEventListener("click", () => {
    window.location.href = 'dashboard.html';
});

document.getElementById("leaderboard-title").textContent = `Leaderboard for ${quizId.replace(/-/g, ' ')}`;