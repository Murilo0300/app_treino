import { auth, db } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    doc,
    setDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


// ==========================================
// TESTE DE LOGIN
// ==========================================

const email = prompt("Digite seu e-mail:");
const senha = prompt("Digite sua senha:");

try {

    const userCredential =
        await signInWithEmailAndPassword(auth, email, senha);

    const usuario = userCredential.user;

    console.log("Login realizado!");
    console.log("UID:", usuario.uid);


    // ======================================
    // TESTE DE GRAVAÇÃO NO FIRESTORE
    // ======================================

    await setDoc(
        doc(db, "usuarios", usuario.uid, "configuracoes", "perfil"),
        {
            aplicativo: "Meu Treino",
            testeFirebase: true,
            atualizadoEm: serverTimestamp()
        }
    );


    alert("Firebase conectado e Firestore funcionando!");

    console.log("Documento gravado no Firestore.");

}
catch (erro) {

    console.error(erro);

    alert(
        "Erro Firebase: " +
        erro.code
    );

}