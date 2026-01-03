import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase, ref, get, child } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyAbVB5CcSGgtOY856Wv_nNdJP-z2oD3X_k",
  authDomain: "piscinaflorangel.firebaseapp.com",
  databaseURL: "https://piscinaflorangel-default-rtdb.firebaseio.com",
  projectId: "piscinaflorangel",
  storageBucket: "piscinaflorangel.firebasestorage.app",
  messagingSenderId: "305089524402",
  appId: "1:305089524402:web:2467f46840b9c981004fab"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);
const dbRef = ref(db);

// Elementos DOM
const profilesView = document.getElementById('profilesView');
const profileGrid = document.getElementById('profileGrid');
const loadingText = document.getElementById('loading');
const passwordArea = document.getElementById('passwordArea');
const passwordInput = document.getElementById('passwordInput');
const errorMsg = document.getElementById('errorMsg');

// Variables temporales
let currentSelectedEmail = "";

// 1. Verificar si ya hay sesión
onAuthStateChanged(auth, (user) => {
    if (user) window.location.href = "index.html"; // Si ya entró, mandar al dashboard
    else loadProfiles(); // Si no, cargar perfiles
});

// 2. Cargar perfiles desde la DB ("allowed_users")
function loadProfiles() {
    get(child(dbRef, 'allowed_users')).then((snapshot) => {
        if (snapshot.exists()) {
            const users = snapshot.val();
            renderProfiles(users);
        } else {
            loadingText.innerText = "No se encontraron usuarios configurados.";
        }
    }).catch((error) => {
        loadingText.innerText = "Error cargando perfiles.";
        console.error(error);
    });
}

// 3. Dibujar los perfiles en pantalla
function renderProfiles(users) {
    loadingText.style.display = 'none';
    profileGrid.innerHTML = "";

    Object.values(users).forEach(user => {
        const card = document.createElement('div');
        card.className = 'profile-card';
        card.innerHTML = `
            <img src="${user.avatar}" class="avatar-img" alt="Avatar">
            <span class="profile-name">${user.name}</span>
            <span class="profile-role">${user.role || 'Staff'}</span>
        `;
        
        // Al hacer click, guardamos el email y mostramos el campo de contraseña
        card.onclick = () => selectUser(user);
        profileGrid.appendChild(card);
    });
}

// 4. Lógica de selección
function selectUser(user) {
    currentSelectedEmail = user.email;
    
    // UI: Ocultar grid, mostrar password
    profilesView.style.display = 'none';
    passwordArea.style.display = 'flex';
    
    // Setear datos visuales
    document.getElementById('selectedAvatar').src = user.avatar;
    document.getElementById('selectedName').innerText = user.name;
    
    passwordInput.value = "";
    passwordInput.focus();
    errorMsg.style.display = 'none';
}

// 5. Volver atrás
window.resetView = () => {
    passwordArea.style.display = 'none';
    profilesView.style.display = 'block';
    currentSelectedEmail = "";
};

// 6. Intentar Login
passwordArea.addEventListener('submit', (e) => {
    e.preventDefault();
    const password = passwordInput.value;
    const btn = passwordArea.querySelector('button[type="submit"]');

    btn.innerText = "Verificando...";
    btn.disabled = true;

    signInWithEmailAndPassword(auth, currentSelectedEmail, password)
        .then(() => {
            console.log("Login correcto");
            // Redirección automática por el onAuthStateChanged
        })
        .catch((error) => {
            btn.innerText = "Ingresar";
            btn.disabled = false;
            errorMsg.style.display = 'block';
            errorMsg.innerText = "Contraseña incorrecta";
            passwordInput.value = "";
            passwordInput.focus();
        });
});