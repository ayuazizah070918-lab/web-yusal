import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCiITtDaCJwgb1XoEZ9bXdoqQRUisYL3p8",
  authDomain: "web-yusal.firebaseapp.com",
  databaseURL: "https://web-yusal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-yusal",
  storageBucket: "web-yusal.firebasestorage.app",
  messagingSenderId: "554310887953",
  appId: "1:554310887953:web:1ee0bd74d74bb0b9891fb0",
  measurementId: "G-JEBYR8554X"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

let currentUser = "";
let mySymbol = ""; // Untuk game: 'X' atau 'O'

// ================= LOGIN & NAVIGASI =================
window.login = function() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "yudisalsa" && pass === "30102007") {
        let who = prompt("Siapa yang main HP ini? (Ketik Yudi atau Salsa)");
        if(who && (who.toLowerCase() === 'yudi' || who.toLowerCase() === 'salsa')) {
            currentUser = who.charAt(0).toUpperCase() + who.slice(1);
            document.getElementById("user-display").innerText = currentUser;
            
            // Set simbol game (Yudi = X, Salsa = O)
            mySymbol = (currentUser.toLowerCase() === 'yudi') ? 'X' : 'O';
            
            goToPage('home-page');
            loadChat();
            listenGame();
        } else {
            alert("Harus ketik Yudi atau Salsa ya!");
        }
    } else {
        document.getElementById("login-error").style.display = "block";
    }
}

window.goToPage = function(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    if(pageId !== 'login-page') {
        history.pushState({ page: pageId }, null, "");
    }
}

window.goBack = function() { history.back(); }

window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(event.state.page).classList.add('active');
    } else {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('home-page').classList.add('active');
    }
});

// ================= LIVE CHAT =================
window.handleEnter = function(e) {
    if(e.key === 'Enter') sendMessage();
}

window.sendMessage = function() {
    const input = document.getElementById("message-input");
    const msg = input.value;
    if(msg.trim() !== "") {
        // Ambil jam saat ini
        const date = new Date();
        const time = date.getHours().toString().padStart(2, '0') + ":" + date.getMinutes().toString().padStart(2, '0');

        push(ref(db, "messages"), {
            sender: currentUser,
            text: msg,
            time: time,
            timestamp: Date.now()
        });
        input.value = "";
    }
}

function loadChat() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    
    onChildAdded(ref(db, "messages"), (snapshot) => {
        const data = snapshot.val();
        const div = document.createElement("div");
        div.classList.add("bubble");
        
        const timeHTML = `<span class="time-stamp">${data.time || ''}</span>`;
        
        if (data.sender === currentUser) {
            div.classList.add("my-message");
            div.innerHTML = `${data.text} ${timeHTML}`;
        } else {
            div.classList.add("other-message");
            div.innerHTML = `<span class="sender-name">${data.sender}</span>${data.text} ${timeHTML}`;
        }
        
        chatBox.appendChild(div);
        setTimeout(() => { chatBox.scrollTop = chatBox.scrollHeight; }, 100);
    });
}

// ================= ALAT KASIR SALSA =================
window.hitungVocer = function() {
    let nama = document.getElementById("vocer-nama").value || "Voucher";
    let awal = parseFloat(document.getElementById("vocer-awal").value) || 0;
    let sisa = parseFloat(document.getElementById("vocer-sisa").value) || 0;
    let harga = parseFloat(document.getElementById("vocer-harga").value) || 0;

    let terjual = awal - sisa;
    let pendapatan = terjual * harga;

    document.getElementById("hasil-vocer").innerText = 
        `🛒 Laporan ${nama}:\n📌 Laku: ${terjual} pcs\n💰 Uang Masuk: Rp ${pendapatan.toLocaleString('id-ID')}`;
}

window.hitungChip = function() {
    let modal = parseFloat(document.getElementById("chip-modal").value) || 0;
    let sisa = parseFloat(document.getElementById("chip-sisa").value) || 0;
    let cash = parseFloat(document.getElementById("uang-cash").value) || 0;

    let terpakai = modal - sisa;
    
    document.getElementById("hasil-chip").innerText = 
        `📊 Laporan Chip:\n💸 Chip Keluar: ${terpakai.toFixed(2)} B\n💵 Total Uang Fisik: Rp ${cash.toLocaleString('id-ID')}`;
}

// ================= GAME TIC-TAC-TOE REALTIME =================
let gameBoard = ["", "", "", "", "", "", "", "", ""];
let currentTurn = "X"; // X jalan duluan
let gameActive = true;

function listenGame() {
    onValue(ref(db, "tictactoe"), (snapshot) => {
        const data = snapshot.val();
        if(data) {
            gameBoard = data.board || ["", "", "", "", "", "", "", "", ""];
            currentTurn = data.turn || "X";
            gameActive = data.active !== undefined ? data.active : true;
            updateBoardUI();
            checkWinner();
        }
    });
}

window.makeMove = function(index) {
    // Cek apakah kotak kosong, game masih jalan, dan apakah ini giliran pemain tersebut
    if (gameBoard[index] === "" && gameActive && currentTurn === mySymbol) {
        gameBoard[index] = mySymbol;
        let nextTurn = mySymbol === "X" ? "O" : "X";
        
        // Kirim gerakan ke Firebase agar HP satu lagi juga terupdate
        set(ref(db, "tictactoe"), {
            board: gameBoard,
            turn: nextTurn,
            active: true
        });
    } else if (currentTurn !== mySymbol && gameActive) {
        alert("Sabar sayang, ini giliran ayang kamu!");
    }
}

function updateBoardUI() {
    for (let i = 0; i < 9; i++) {
        let cell = document.getElementById(`cell-${i}`);
        cell.innerText = gameBoard[i];
        cell.style.color = gameBoard[i] === 'X' ? 'var(--primary-orange)' : 'var(--dark-blue)';
    }
    
    let statusText = "";
    if(!gameActive) return; // Status akan diubah oleh checkWinner

    if(currentTurn === mySymbol) {
        statusText = "🟢 Giliran Kamu!";
    } else {
        statusText = "⏳ Menunggu ayang jalan...";
    }
    document.getElementById("game-status").innerText = statusText;
}

function checkWinner() {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertikal
        [0, 4, 8], [2, 4, 6]             // Diagonal
    ];

    let roundWon = false;
    let winnerSymbol = "";

    for (let i = 0; i < winConditions.length; i++) {
        const [a, b, c] = winConditions[i];
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            roundWon = true;
            winnerSymbol = gameBoard[a];
            break;
        }
    }

    if (roundWon) {
        gameActive = false;
        let winnerName = (winnerSymbol === 'X') ? "Yudi" : "Salsa";
        document.getElementById("game-status").innerText = `🎉 ${winnerName} MENANG! 🎉`;
        return;
    }

    if (!gameBoard.includes("")) {
        gameActive = false;
        document.getElementById("game-status").innerText = "🤝 Yaaah Seri!";
    }
}

window.resetGame = function() {
    // Reset papan di Firebase
    set(ref(db, "tictactoe"), {
        board: ["", "", "", "", "", "", "", "", ""],
        turn: "X",
        active: true
    });
}

