import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded, set, onValue } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

// Konfigurasi Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCiITtDaCJwgb1XoEZ9bXdoqQRUisYL3p8",
  authDomain: "web-yusal.firebaseapp.com",
  databaseURL: "https://web-yusal-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "web-yusal",
  storageBucket: "web-yusal.firebasestorage.app",
  messagingSenderId: "554310887953",
  appId: "1:554310887953:web:1ee0bd74d74bb0b9891fb0"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// State Aplikasi
let currentUser = "";
let mySymbol = ""; 

// 1. Fungsi Login & Navigasi
window.login = function() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "yudisalsa" && pass === "30102007") {
        let who = prompt("Siapa yang main HP ini? (Ketik Yudi atau Salsa)");
        if(who && (who.toLowerCase() === 'yudi' || who.toLowerCase() === 'salsa')) {
            currentUser = who.charAt(0).toUpperCase() + who.slice(1);
            document.getElementById("user-display").innerText = currentUser;
            mySymbol = (currentUser.toLowerCase() === 'yudi') ? 'X' : 'O';
            goToPage('home-page');
            initListeners();
        } else {
            alert("Harus ketik Yudi atau Salsa ya!");
        }
    } else {
        document.getElementById("login-error").style.display = "block";
    }
};

window.goToPage = function(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    history.pushState({ page: pageId }, null, "");
};

window.goBack = function() { history.back(); };

window.addEventListener('popstate', (event) => {
    const page = event.state?.page || 'home-page';
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
});

// 2. Inisialisasi Listener (Chat & Game)
function initListeners() {
    loadChat();
    listenGame();
}

// 3. Logika Chat Real-time
window.handleEnter = (e) => { if(e.key === 'Enter') sendMessage(); };

window.sendMessage = function() {
    const input = document.getElementById("message-input");
    if(input.value.trim() !== "") {
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        push(ref(db, "messages"), {
            sender: currentUser,
            text: input.value,
            time: time,
            timestamp: Date.now()
        });
        input.value = "";
    }
};

function loadChat() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = "";
    onChildAdded(ref(db, "messages"), (snapshot) => {
        const data = snapshot.val();
        const div = document.createElement("div");
        div.className = `bubble ${data.sender === currentUser ? 'my-message' : 'other-message'}`;
        div.innerHTML = data.sender !== currentUser ? 
            `<span class="sender-name">${data.sender}</span>${data.text}<span class="time-stamp">${data.time}</span>` :
            `${data.text}<span class="time-stamp">${data.time}</span>`;
        chatBox.appendChild(div);
        chatBox.scrollTo({ top: chatBox.scrollHeight, behavior: 'smooth' });
    });
}

// 4. Logika Game Tic-Tac-Toe Real-time
function listenGame() {
    onValue(ref(db, "tictactoe"), (snapshot) => {
        const data = snapshot.val() || { board: Array(9).fill(""), turn: "X", active: true };
        updateBoardUI(data.board, data.turn, data.active);
    });
}

window.makeMove = function(index) {
    onValue(ref(db, "tictactoe"), (snapshot) => {
        const data = snapshot.val();
        if (data.board[index] === "" && data.turn === mySymbol && data.active) {
            data.board[index] = mySymbol;
            data.turn = mySymbol === "X" ? "O" : "X";
            
            // Cek kemenangan sebelum update
            const winner = checkWinner(data.board);
            if(winner) data.active = false;

            set(ref(db, "tictactoe"), data);
        }
    }, { onlyOnce: true });
};

function updateBoardUI(board, turn, active) {
    board.forEach((val, i) => {
        const cell = document.getElementById(`cell-${i}`);
        cell.innerText = val;
    });
    
    const status = document.getElementById("game-status");
    if(!active) {
        status.innerText = checkWinner(board) ? `🎉 ${checkWinner(board)} Menang!` : "🤝 Seri!";
    } else {
        status.innerText = (turn === mySymbol) ? "🟢 Giliran Kamu!" : "⏳ Menunggu Ayang...";
    }
}

function checkWinner(b) {
    const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(let [a,c,d] of lines) {
        if(b[a] && b[a] === b[c] && b[a] === b[d]) return b[a] === 'X' ? 'Yudi' : 'Salsa';
    }
    return null;
}

window.resetGame = () => {
    set(ref(db, "tictactoe"), { board: Array(9).fill(""), turn: "X", active: true });
};

// 5. Alat Kasir
window.hitungVocer = () => {
    const laku = parseFloat(document.getElementById("vocer-awal").value) - parseFloat(document.getElementById("vocer-sisa").value);
    const total = laku * parseFloat(document.getElementById("vocer-harga").value);
    document.getElementById("hasil-vocer").innerText = `Laku: ${laku} pcs\nTotal: Rp ${total.toLocaleString()}`;
};

window.hitungChip = () => {
    const terpakai = parseFloat(document.getElementById("chip-modal").value) - parseFloat(document.getElementById("chip-sisa").value);
    const cash = parseFloat(document.getElementById("uang-cash").value);
    document.getElementById("hasil-chip").innerText = `Chip Keluar: ${terpakai.toFixed(2)} B\nUang: Rp ${cash.toLocaleString()}`;
};

