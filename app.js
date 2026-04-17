// Konfigurasi Firebase dari API kamu
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getDatabase, ref, push, onChildAdded } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-database.js";

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

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Variabel User
let currentUser = "";

// LOGIKA LOGIN
window.login = function() {
    const user = document.getElementById("username").value;
    const pass = document.getElementById("password").value;

    if (user === "yudisalsa" && pass === "30102007") {
        // Karena kalian pakai berdua, mari kita tanya siapa yang sedang pegang HP
        let who = prompt("Siapa yang sedang masuk? Ketik 'Yudi' atau 'Salsa'");
        if(who) {
            currentUser = who;
            document.getElementById("user-display").innerText = currentUser;
            goToPage('home-page');
            loadChat(); // Panggil fungsi chat saat masuk
        }
    } else {
        document.getElementById("login-error").style.display = "block";
    }
}

// LOGIKA NAVIGASI & GESTUR BACK HP
window.goToPage = function(pageId) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.getElementById(pageId).classList.add('active');
    
    // Menambahkan history ke browser agar gestur back di HP tidak menutup web
    if(pageId !== 'login-page') {
        history.pushState({ page: pageId }, null, "");
    }
}

window.goBack = function() {
    history.back(); // Memanggil fungsi bawaan HP/Browser
}

// Menangkap gestur back dari HP
window.addEventListener('popstate', (event) => {
    if (event.state && event.state.page) {
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(event.state.page).classList.add('active');
    } else {
        // Jika tidak ada history, kembali ke home
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById('home-page').classList.add('active');
    }
});

// LOGIKA ALAT KONTER SALSA
window.hitungVocer = function() {
    let nama = document.getElementById("vocer-nama").value || "Voucher";
    let awal = parseFloat(document.getElementById("vocer-awal").value) || 0;
    let sisa = parseFloat(document.getElementById("vocer-sisa").value) || 0;
    let harga = parseFloat(document.getElementById("vocer-harga").value) || 0;

    let terjual = awal - sisa;
    let pendapatan = terjual * harga;

    document.getElementById("hasil-vocer").innerText = 
        `Laporan ${nama}:\nTerjual: ${terjual} pcs\nTotal Uang Masuk: Rp ${pendapatan.toLocaleString('id-ID')}`;
}

window.hitungChip = function() {
    let modal = parseFloat(document.getElementById("chip-modal").value) || 0;
    let sisa = parseFloat(document.getElementById("chip-sisa").value) || 0;
    let cash = parseFloat(document.getElementById("uang-cash").value) || 0;

    let terpakai = modal - sisa;
    // Asumsi admin adalah selisih uang cash dengan modal chip yang terjual
    // Rumus ini bisa kamu sesuaikan lagi dengan cara Salsa menghitung marginnya
    
    document.getElementById("hasil-chip").innerText = 
        `Laporan Chip:\nChip Keluar: ${terpakai.toFixed(2)} B\nUang Di Laci: Rp ${cash.toLocaleString('id-ID')}`;
}

// LOGIKA CHAT FIREBASE
window.sendMessage = function() {
    const input = document.getElementById("message-input");
    const msg = input.value;
    if(msg.trim() !== "") {
        push(ref(db, "messages"), {
            sender: currentUser,
            text: msg,
            timestamp: Date.now()
        });
        input.value = "";
    }
}

function loadChat() {
    const chatBox = document.getElementById("chat-box");
    chatBox.innerHTML = ""; // Bersihkan chat sebelumnya
    
    const messagesRef = ref(db, "messages");
    onChildAdded(messagesRef, (snapshot) => {
        const data = snapshot.val();
        const div = document.createElement("div");
        div.classList.add("bubble");
        
        // Tentukan warna bubble berdasarkan siapa yang mengirim
        if (data.sender === currentUser) {
            div.classList.add("my-message");
            div.innerText = data.text;
        } else {
            div.classList.add("other-message");
            div.innerHTML = `<strong>${data.sender}</strong><br>${data.text}`;
        }
        
        chatBox.appendChild(div);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto scroll ke bawah
    });
}
