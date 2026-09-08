import { auth } from "./firebase.js";

import {
    signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";


// TESTE TEMPORÁRIO DE LOGIN

const email = prompt("Digite seu e-mail:");
const senha = prompt("Digite sua senha:");

signInWithEmailAndPassword(auth, email, senha)
    .then((userCredential) => {

        console.log("Firebase conectado!");
        console.log("Usuário:", userCredential.user.email);
        console.log("UID:", userCredential.user.uid);

        alert("Login realizado com sucesso!");

    })
    .catch((erro) => {

        console.error("Erro no login:", erro);

        alert("Erro ao fazer login: " + erro.code);

    });