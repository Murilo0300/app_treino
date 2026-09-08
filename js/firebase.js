// ==========================================
// FIREBASE - MEU TREINO
// ==========================================

// Firebase App
import { initializeApp } from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-app.js";

// Firestore
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager
} from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";

// Authentication
import {
    getAuth
} from
"https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


// ==========================================
// CONFIGURAÇÃO DO FIREBASE
// ==========================================

const firebaseConfig = {
    apiKey: "AIzaSyCLlyEdw9v5DmVhQtBBfDOsSU3V4amnG-o",
    authDomain: "meu-treino-8722a.firebaseapp.com",
    projectId: "meu-treino-8722a",
    storageBucket: "meu-treino-8722a.firebasestorage.app",
    messagingSenderId: "6605929371",
    appId: "1:6605929371:web:f3dc5fe7d33111ae907f3e"
};


// ==========================================
// INICIALIZAÇÃO
// ==========================================

const app = initializeApp(firebaseConfig);


// Firestore com cache persistente
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});


// Firebase Authentication
const auth = getAuth(app);


// ==========================================
// EXPORTA PARA OS OUTROS ARQUIVOS
// ==========================================

export {
    app,
    db,
    auth
};