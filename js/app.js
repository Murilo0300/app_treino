/* =========================================================
   FIREBASE
========================================================= */

import { auth, db } from "./firebase.js";

import {
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-auth.js";

import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.7.0/firebase-firestore.js";


/* =========================================================
   DADOS
========================================================= */

let treinos =
    JSON.parse(localStorage.getItem("treinos")) || [];

let exercicios = [];

let usuarioAtual = null;

let treinoSelecionado = null;
let exercicioSelecionadoParaAdicionar = null;
let itemTreinoSendoEditado = null;
let exercicioBancoSendoEditado = null;

let imagemSelecionada = "";
let imagemEdicao = "";


/* =========================================================
   FIRESTORE - EXERCÍCIOS
========================================================= */

async function carregarExerciciosFirebase() {

    if (!usuarioAtual) return;

    try {

        const referencia = collection(
            db,
            "usuarios",
            usuarioAtual.uid,
            "exercicios"
        );

        const resultado = await getDocs(referencia);

        exercicios = resultado.docs.map(documento => ({
            id: Number(documento.id),
            ...documento.data()
        }));

        atualizarExercicios();
        atualizarResumo();

        console.log(
            "Exercícios carregados:",
            exercicios.length
        );

    } catch (erro) {

        console.error(
            "Erro ao carregar exercícios:",
            erro
        );

    }

}


async function salvarExercicioFirebase(exercicio) {

    if (!usuarioAtual) {
        throw new Error("Usuário não autenticado.");
    }

    await setDoc(
        doc(
            db,
            "usuarios",
            usuarioAtual.uid,
            "exercicios",
            String(exercicio.id)
        ),
        {
            nome: exercicio.nome,
            grupo: exercicio.grupo,

            // Imagem será migrada para Firebase Storage depois.
            imagem: "",

            atualizadoEm: serverTimestamp()
        }
    );

}


async function excluirExercicioFirebase(id) {

    if (!usuarioAtual) {
        throw new Error("Usuário não autenticado.");
    }

    await deleteDoc(
        doc(
            db,
            "usuarios",
            usuarioAtual.uid,
            "exercicios",
            String(id)
        )
    );

}


/* =========================================================
   MIGRAÇÃO DOS TREINOS ANTIGOS
========================================================= */

function migrarDadosAntigos() {

    treinos.forEach(treino => {

        if (!Array.isArray(treino.exercicios)) {
            treino.exercicios = [];
        }

        treino.exercicios =
            treino.exercicios.map(item => {

                if (
                    typeof item === "number" ||
                    typeof item === "string"
                ) {

                    return {
                        id:
                            Date.now() +
                            Math.floor(
                                Math.random() * 100000
                            ),

                        exercicioId: Number(item),
                        carga: 20,
                        repeticoes: 12,
                        series: 3
                    };

                }

                return item;

            });

    });

    salvarTreinosLocalmente();

}


/* =========================================================
   TREINOS - LOCALSTORAGE TEMPORÁRIO
========================================================= */

function salvarTreinosLocalmente() {

    localStorage.setItem(
        "treinos",
        JSON.stringify(treinos)
    );

    atualizarResumo();

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function abrirTela(id) {

    document
        .querySelectorAll(".tela")
        .forEach(tela => {
            tela.classList.remove("ativa");
        });


    const tela =
        document.getElementById(id);

    if (tela) {
        tela.classList.add("ativa");
    }


    document
        .querySelectorAll(".menu-inferior button")
        .forEach(botao => {
            botao.classList.remove("menu-ativo");
        });


    const mapa = {
        "tela-inicio": 0,
        "tela-treinos": 1,
        "tela-exercicios": 2,
        "tela-historico": 3
    };


    if (mapa[id] !== undefined) {

        const botoes =
            document.querySelectorAll(
                ".menu-inferior button"
            );

        if (botoes[mapa[id]]) {
            botoes[mapa[id]]
                .classList.add("menu-ativo");
        }

    }


    if (id === "tela-exercicios") {
        atualizarExercicios();
    }

    if (id === "tela-treinos") {
        atualizarTreinos();
    }

}


/* =========================================================
   TREINO - MODAL
========================================================= */

function abrirModalTreino() {

    document
        .getElementById("modal-treino")
        .classList.add("aberto");

}


function fecharModalTreino() {

    document
        .getElementById("modal-treino")
        .classList.remove("aberto");

}


/* =========================================================
   CRIAR TREINO
========================================================= */

document
    .getElementById("form-treino")
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();

            const nome =
                document
                    .getElementById("nome-treino")
                    .value
                    .trim();

            const descricao =
                document
                    .getElementById("descricao-treino")
                    .value
                    .trim();

            if (!nome) return;


            treinos.push({
                id: Date.now(),
                nome,
                descricao,
                exercicios: []
            });


            salvarTreinosLocalmente();
            atualizarTreinos();

            fecharModalTreino();

            this.reset();

        }
    );


/* =========================================================
   NOVO EXERCÍCIO
========================================================= */

function abrirModalExercicio() {

    imagemSelecionada = "";

    document
        .getElementById("form-exercicio")
        .reset();

    document
        .getElementById("preview-container")
        .classList.remove("ativo");

    document
        .getElementById("preview-imagem")
        .removeAttribute("src");

    document
        .getElementById("modal-exercicio")
        .classList.add("aberto");

}


function fecharModalExercicio() {

    document
        .getElementById("modal-exercicio")
        .classList.remove("aberto");

}


/* =========================================================
   IMAGEM - NOVO EXERCÍCIO
========================================================= */

document
    .getElementById("imagem-exercicio")
    .addEventListener(
        "change",
        function(event) {

            const arquivo =
                event.target.files[0];

            if (!arquivo) return;


            if (!arquivo.type.startsWith("image/")) {

                alert("Selecione uma imagem válida.");

                this.value = "";

                return;

            }


            const reader = new FileReader();


            reader.onload = function(evento) {

                imagemSelecionada =
                    evento.target.result;

                document
                    .getElementById("preview-imagem")
                    .src =
                    imagemSelecionada;

                document
                    .getElementById("preview-container")
                    .classList.add("ativo");

            };


            reader.readAsDataURL(arquivo);

        }
    );


/* =========================================================
   CADASTRAR EXERCÍCIO
========================================================= */

document
    .getElementById("form-exercicio")
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (!usuarioAtual) {

                alert(
                    "Aguarde a conexão com sua conta."
                );

                return;

            }


            const nome =
                document
                    .getElementById("nome-exercicio")
                    .value
                    .trim();

            const grupo =
                document
                    .getElementById("grupo-exercicio")
                    .value;


            if (!nome || !grupo) return;


            const novoExercicio = {

                id: Date.now(),

                nome,

                grupo,

                /*
                A imagem aparece nesta sessão,
                mas ainda não vai para o Firebase.
                */
                imagem: imagemSelecionada

            };


            try {

                await salvarExercicioFirebase(
                    novoExercicio
                );

                exercicios.push(
                    novoExercicio
                );

                atualizarExercicios();
                atualizarResumo();

                fecharModalExercicio();

                this.reset();

                imagemSelecionada = "";

                console.log(
                    "Exercício salvo no Firestore."
                );

            } catch (erro) {

                console.error(erro);

                alert(
                    "Não foi possível salvar o exercício."
                );

            }

        }
    );


/* =========================================================
   MOSTRAR EXERCÍCIOS
========================================================= */

function atualizarExercicios() {

    const lista =
        document.getElementById(
            "lista-exercicios"
        );

    const vazio =
        document.getElementById(
            "exercicios-vazio"
        );

    const filtro =
        document.getElementById(
            "filtro-grupo"
        ).value;


    lista.innerHTML = "";


    const resultado =
        exercicios.filter(exercicio => {

            return (
                filtro === "Todos" ||
                exercicio.grupo === filtro
            );

        });


    if (resultado.length === 0) {

        vazio.style.display = "block";

        return;

    }


    vazio.style.display = "none";


    resultado.forEach(exercicio => {

        const card =
            document.createElement("div");

        card.className =
            "card-exercicio";


        const imagem =
            exercicio.imagem

                ? `
                    <img
                        class="imagem-exercicio"
                        src="${exercicio.imagem}"
                        alt="${exercicio.nome}">
                  `

                : `
                    <div class="sem-imagem">
                        🏋️
                    </div>
                  `;


        card.innerHTML = `

            ${imagem}

            <div class="conteudo-exercicio">

                <span class="grupo-muscular">
                    ${exercicio.grupo}
                </span>

                <h3>
                    ${exercicio.nome}
                </h3>

                <div class="acoes-exercicio">

                    <button
                        class="botao-editar-banco"
                        onclick="abrirEditarExercicio(${exercicio.id})">

                        ✏️ Editar

                    </button>

                    <button
                        class="botao-excluir-banco"
                        onclick="excluirExercicio(${exercicio.id})">

                        🗑️ Excluir

                    </button>

                </div>

            </div>
        `;


        lista.appendChild(card);

    });

}


/* =========================================================
   EDITAR EXERCÍCIO
========================================================= */

function abrirEditarExercicio(id) {

    exercicioBancoSendoEditado =
        exercicios.find(
            exercicio =>
                exercicio.id === id
        );


    if (!exercicioBancoSendoEditado) {
        return;
    }


    document
        .getElementById(
            "editar-exercicio-nome"
        )
        .value =
        exercicioBancoSendoEditado.nome;


    document
        .getElementById(
            "editar-exercicio-grupo"
        )
        .value =
        exercicioBancoSendoEditado.grupo;


    imagemEdicao =
        exercicioBancoSendoEditado.imagem || "";


    atualizarPreviewEdicao();


    document
        .getElementById(
            "editar-exercicio-imagem"
        )
        .value = "";


    document
        .getElementById(
            "modal-editar-exercicio"
        )
        .classList.add("aberto");

}


/* =========================================================
   PREVIEW DA EDIÇÃO
========================================================= */

function atualizarPreviewEdicao() {

    const container =
        document.getElementById(
            "editar-preview-container"
        );

    const imagem =
        document.getElementById(
            "editar-preview-imagem"
        );

    const botaoRemover =
        document.getElementById(
            "botao-remover-imagem"
        );


    if (imagemEdicao) {

        imagem.src = imagemEdicao;

        container.classList.add("ativo");

        botaoRemover.style.display =
            "block";

    } else {

        imagem.removeAttribute("src");

        container.classList.remove("ativo");

        botaoRemover.style.display =
            "none";

    }

}


/* =========================================================
   TROCAR IMAGEM NA EDIÇÃO
========================================================= */

document
    .getElementById(
        "editar-exercicio-imagem"
    )
    .addEventListener(
        "change",
        function(event) {

            const arquivo =
                event.target.files[0];

            if (!arquivo) return;


            if (
                !arquivo.type.startsWith(
                    "image/"
                )
            ) {

                alert(
                    "Selecione uma imagem válida."
                );

                this.value = "";

                return;

            }


            const reader =
                new FileReader();


            reader.onload =
                function(evento) {

                    imagemEdicao =
                        evento.target.result;

                    atualizarPreviewEdicao();

                };


            reader.readAsDataURL(
                arquivo
            );

        }
    );


/* =========================================================
   REMOVER IMAGEM
========================================================= */

function removerImagemEdicao() {

    imagemEdicao = "";

    document
        .getElementById(
            "editar-exercicio-imagem"
        )
        .value = "";

    atualizarPreviewEdicao();

}


/* =========================================================
   SALVAR EDIÇÃO DO EXERCÍCIO
========================================================= */

document
    .getElementById(
        "form-editar-exercicio"
    )
    .addEventListener(
        "submit",
        async function(event) {

            event.preventDefault();


            if (
                !exercicioBancoSendoEditado ||
                !usuarioAtual
            ) {
                return;
            }


            const nome =
                document
                    .getElementById(
                        "editar-exercicio-nome"
                    )
                    .value
                    .trim();

            const grupo =
                document
                    .getElementById(
                        "editar-exercicio-grupo"
                    )
                    .value;


            if (!nome || !grupo) return;


            const dadosAnteriores = {
                nome:
                    exercicioBancoSendoEditado.nome,

                grupo:
                    exercicioBancoSendoEditado.grupo,

                imagem:
                    exercicioBancoSendoEditado.imagem
            };


            exercicioBancoSendoEditado.nome =
                nome;

            exercicioBancoSendoEditado.grupo =
                grupo;

            exercicioBancoSendoEditado.imagem =
                imagemEdicao;


            try {

                await salvarExercicioFirebase(
                    exercicioBancoSendoEditado
                );

                atualizarExercicios();
                atualizarTreinos();

                if (treinoSelecionado) {
                    atualizarExerciciosDoTreino();
                }

                fecharModalEditarExercicio();

            } catch (erro) {

                exercicioBancoSendoEditado.nome =
                    dadosAnteriores.nome;

                exercicioBancoSendoEditado.grupo =
                    dadosAnteriores.grupo;

                exercicioBancoSendoEditado.imagem =
                    dadosAnteriores.imagem;

                console.error(erro);

                alert(
                    "Não foi possível atualizar o exercício."
                );

            }

        }
    );


function fecharModalEditarExercicio() {

    document
        .getElementById(
            "modal-editar-exercicio"
        )
        .classList.remove("aberto");

    exercicioBancoSendoEditado = null;

    imagemEdicao = "";

}


/* =========================================================
   EXCLUIR EXERCÍCIO
========================================================= */

async function excluirExercicio(id) {

    const exercicio =
        exercicios.find(
            item => item.id === id
        );


    if (!exercicio) return;


    const treinosUsando =
        treinos.filter(treino => {

            return treino.exercicios.some(
                item =>
                    item.exercicioId === id
            );

        });


    let mensagem =
        `Deseja realmente excluir "${exercicio.nome}"?`;


    if (treinosUsando.length > 0) {

        mensagem +=
            `\n\nEste exercício está em ${treinosUsando.length} treino(s).` +
            `\nEle também será removido desses treinos.`;

    }


    if (!confirm(mensagem)) return;


    try {

        await excluirExercicioFirebase(id);


        exercicios =
            exercicios.filter(
                item => item.id !== id
            );


        treinos.forEach(treino => {

            treino.exercicios =
                treino.exercicios.filter(
                    item =>
                        item.exercicioId !== id
                );

        });


        salvarTreinosLocalmente();

        atualizarExercicios();
        atualizarTreinos();


        if (treinoSelecionado) {
            atualizarExerciciosDoTreino();
        }

    } catch (erro) {

        console.error(erro);

        alert(
            "Não foi possível excluir o exercício."
        );

    }

}


/* =========================================================
   MOSTRAR TREINOS
========================================================= */

function atualizarTreinos() {

    const lista =
        document.getElementById(
            "lista-treinos"
        );

    const vazio =
        document.getElementById(
            "treinos-vazio"
        );


    lista.innerHTML = "";


    if (treinos.length === 0) {

        vazio.style.display = "block";

        return;

    }


    vazio.style.display = "none";


    treinos.forEach(treino => {

        const quantidade =
            treino.exercicios.length;

        const card =
            document.createElement("div");

        card.className =
            "item-lista";


        card.innerHTML = `

            <h3>
                ${treino.nome}
            </h3>

            <p>
                ${treino.descricao || "Sem descrição"}
            </p>

            <p style="margin-top:10px;">

                ${quantidade}

                exercício${quantidade === 1 ? "" : "s"}

            </p>

            <button
                class="botao-abrir-treino"
                onclick="abrirTreino(${treino.id})">

                Abrir treino

            </button>
        `;


        lista.appendChild(card);

    });

}


/* =========================================================
   ABRIR TREINO
========================================================= */

function abrirTreino(id) {

    treinoSelecionado =
        treinos.find(
            treino =>
                treino.id === id
        );


    if (!treinoSelecionado) return;


    document
        .getElementById(
            "detalhe-nome-treino"
        )
        .textContent =
        treinoSelecionado.nome;


    document
        .getElementById(
            "detalhe-descricao-treino"
        )
        .textContent =
        treinoSelecionado.descricao || "";


    atualizarExerciciosDoTreino();

    abrirTela(
        "tela-detalhes-treino"
    );

}


/* =========================================================
   MODAL ADICIONAR EXERCÍCIO AO TREINO
========================================================= */

function abrirModalAdicionarExercicio() {

    if (!treinoSelecionado) return;


    document
        .getElementById(
            "filtro-modal-grupo"
        )
        .value = "Todos";


    listarOpcoesExercicios();


    document
        .getElementById(
            "modal-adicionar-exercicio"
        )
        .classList.add("aberto");

}


function fecharModalAdicionarExercicio() {

    document
        .getElementById(
            "modal-adicionar-exercicio"
        )
        .classList.remove("aberto");

}


/* =========================================================
   LISTAR OPÇÕES DE EXERCÍCIOS
========================================================= */

function listarOpcoesExercicios() {

    if (!treinoSelecionado) return;


    const lista =
        document.getElementById(
            "opcoes-exercicios"
        );

    const filtro =
        document.getElementById(
            "filtro-modal-grupo"
        ).value;


    lista.innerHTML = "";


    const idsNoTreino =
        treinoSelecionado.exercicios.map(
            item => item.exercicioId
        );


    const disponiveis =
        exercicios.filter(exercicio => {

            const grupoCorreto =
                filtro === "Todos" ||
                exercicio.grupo === filtro;

            const aindaNaoAdicionado =
                !idsNoTreino.includes(
                    exercicio.id
                );

            return (
                grupoCorreto &&
                aindaNaoAdicionado
            );

        });


    if (disponiveis.length === 0) {

        lista.innerHTML = `
            <p class="subtitulo">
                Nenhum exercício disponível
                neste grupo.
            </p>
        `;

        return;

    }


    disponiveis.forEach(exercicio => {

        const botao =
            document.createElement("button");

        botao.type = "button";

        botao.className =
            "opcao-exercicio";


        const imagem =
            exercicio.imagem

                ? `
                    <img
                        src="${exercicio.imagem}"
                        alt="${exercicio.nome}">
                  `

                : `
                    <div class="opcao-sem-imagem">
                        🏋️
                    </div>
                  `;


        botao.innerHTML = `

            ${imagem}

            <div>

                <strong>
                    ${exercicio.nome}
                </strong>

                <span>
                    ${exercicio.grupo}
                </span>

            </div>
        `;


        botao.addEventListener(
            "click",
            function() {

                selecionarExercicioParaTreino(
                    exercicio.id
                );

            }
        );


        lista.appendChild(botao);

    });

}


/* =========================================================
   SELECIONAR EXERCÍCIO PARA TREINO
========================================================= */

function selecionarExercicioParaTreino(
    exercicioId
) {

    exercicioSelecionadoParaAdicionar =
        exercicios.find(
            exercicio =>
                exercicio.id === exercicioId
        );


    if (!exercicioSelecionadoParaAdicionar) {
        return;
    }


    document
        .getElementById(
            "config-nome-exercicio"
        )
        .textContent =
        exercicioSelecionadoParaAdicionar.nome;


    document
        .getElementById("config-carga")
        .value = 20;

    document
        .getElementById("config-repeticoes")
        .value = 12;

    document
        .getElementById("config-series")
        .value = 3;


    fecharModalAdicionarExercicio();


    document
        .getElementById(
            "modal-configurar-exercicio"
        )
        .classList.add("aberto");

}


function fecharModalConfigurarExercicio() {

    document
        .getElementById(
            "modal-configurar-exercicio"
        )
        .classList.remove("aberto");

}


/* =========================================================
   ADICIONAR EXERCÍCIO AO TREINO
========================================================= */

document
    .getElementById(
        "form-configurar-exercicio"
    )
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (
                !treinoSelecionado ||
                !exercicioSelecionadoParaAdicionar
            ) {
                return;
            }


            const carga =
                Number(
                    document
                        .getElementById(
                            "config-carga"
                        )
                        .value
                );

            const repeticoes =
                Number(
                    document
                        .getElementById(
                            "config-repeticoes"
                        )
                        .value
                );

            const series =
                Number(
                    document
                        .getElementById(
                            "config-series"
                        )
                        .value
                );


            treinoSelecionado
                .exercicios
                .push({

                    id:
                        Date.now() +
                        Math.floor(
                            Math.random() * 10000
                        ),

                    exercicioId:
                        exercicioSelecionadoParaAdicionar.id,

                    carga,

                    repeticoes,

                    series

                });


            salvarTreinosLocalmente();

            atualizarTreinos();
            atualizarExerciciosDoTreino();

            fecharModalConfigurarExercicio();

            exercicioSelecionadoParaAdicionar =
                null;

        }
    );


/* =========================================================
   EXERCÍCIOS DO TREINO
========================================================= */

function atualizarExerciciosDoTreino() {

    const lista =
        document.getElementById(
            "lista-exercicios-treino"
        );

    const vazio =
        document.getElementById(
            "treino-sem-exercicios"
        );


    lista.innerHTML = "";


    if (
        !treinoSelecionado ||
        treinoSelecionado.exercicios.length === 0
    ) {

        vazio.style.display = "block";

        return;

    }


    vazio.style.display = "none";


    let quantidadeRenderizada = 0;


    treinoSelecionado
        .exercicios
        .forEach(item => {

            const exercicio =
                exercicios.find(
                    ex =>
                        ex.id === item.exercicioId
                );


            if (!exercicio) return;


            quantidadeRenderizada++;


            const card =
                document.createElement("div");

            card.className =
                "item-treino-exercicio";


            const imagem =
                exercicio.imagem

                    ? `
                        <img
                            class="imagem-treino-exercicio"
                            src="${exercicio.imagem}"
                            alt="${exercicio.nome}">
                      `

                    : `
                        <div class="placeholder-treino">
                            🏋️
                        </div>
                      `;


            card.innerHTML = `

                ${imagem}

                <div class="conteudo-treino-exercicio">

                    <div class="linha-titulo-exercicio">

                        <div>

                            <h3>
                                ${exercicio.nome}
                            </h3>

                            <span class="badge-grupo">
                                ${exercicio.grupo}
                            </span>

                        </div>

                        <button
                            class="botao-editar"
                            onclick="abrirEditarTreinoExercicio(${item.id})">

                            ✏️ Editar

                        </button>

                    </div>


                    <div class="info-treino-exercicio">

                        <div>
                            <strong>
                                ${item.carga} kg
                            </strong>
                            <span>Carga</span>
                        </div>

                        <div>
                            <strong>
                                ${item.series}
                            </strong>
                            <span>Séries</span>
                        </div>

                        <div>
                            <strong>
                                ${item.repeticoes}
                            </strong>
                            <span>Repetições</span>
                        </div>

                    </div>

                </div>
            `;


            lista.appendChild(card);

        });


    if (quantidadeRenderizada === 0) {
        vazio.style.display = "block";
    }

}


/* =========================================================
   EDITAR CONFIGURAÇÃO NO TREINO
========================================================= */

function abrirEditarTreinoExercicio(
    itemId
) {

    if (!treinoSelecionado) return;


    itemTreinoSendoEditado =
        treinoSelecionado.exercicios.find(
            item =>
                item.id === itemId
        );


    if (!itemTreinoSendoEditado) return;


    const exercicio =
        exercicios.find(
            ex =>
                ex.id ===
                itemTreinoSendoEditado.exercicioId
        );


    if (!exercicio) return;


    document
        .getElementById(
            "editar-nome-exercicio"
        )
        .textContent =
        exercicio.nome;


    document
        .getElementById(
            "editar-carga"
        )
        .value =
        itemTreinoSendoEditado.carga;


    document
        .getElementById(
            "editar-repeticoes"
        )
        .value =
        itemTreinoSendoEditado.repeticoes;


    document
        .getElementById(
            "editar-series"
        )
        .value =
        itemTreinoSendoEditado.series;


    document
        .getElementById(
            "modal-editar-treino-exercicio"
        )
        .classList.add("aberto");

}


function fecharModalEditarTreinoExercicio() {

    document
        .getElementById(
            "modal-editar-treino-exercicio"
        )
        .classList.remove("aberto");

}


/* =========================================================
   SALVAR CONFIGURAÇÃO DO EXERCÍCIO NO TREINO
========================================================= */

document
    .getElementById(
        "form-editar-treino-exercicio"
    )
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (!itemTreinoSendoEditado) {
                return;
            }


            itemTreinoSendoEditado.carga =
                Number(
                    document
                        .getElementById(
                            "editar-carga"
                        )
                        .value
                );


            itemTreinoSendoEditado.repeticoes =
                Number(
                    document
                        .getElementById(
                            "editar-repeticoes"
                        )
                        .value
                );


            itemTreinoSendoEditado.series =
                Number(
                    document
                        .getElementById(
                            "editar-series"
                        )
                        .value
                );


            salvarTreinosLocalmente();

            atualizarExerciciosDoTreino();

            fecharModalEditarTreinoExercicio();

            itemTreinoSendoEditado = null;

        }
    );


/* =========================================================
   RESUMO
========================================================= */

function atualizarResumo() {

    const totalTreinos =
        document.getElementById(
            "total-treinos"
        );

    const totalExercicios =
        document.getElementById(
            "total-exercicios"
        );


    if (totalTreinos) {
        totalTreinos.textContent =
            treinos.length;
    }

    if (totalExercicios) {
        totalExercicios.textContent =
            exercicios.length;
    }

}


/* =========================================================
   FECHAR MODAL CLICANDO FORA
========================================================= */

window.addEventListener(
    "click",
    function(event) {

        document
            .querySelectorAll(
                ".modal.aberto"
            )
            .forEach(modal => {

                if (event.target === modal) {

                    modal.classList.remove(
                        "aberto"
                    );

                }

            });

    }
);


/* =========================================================
   FUNÇÕES DISPONÍVEIS PARA O HTML
========================================================= */

window.abrirTela =
    abrirTela;

window.abrirModalTreino =
    abrirModalTreino;

window.fecharModalTreino =
    fecharModalTreino;

window.abrirModalExercicio =
    abrirModalExercicio;

window.fecharModalExercicio =
    fecharModalExercicio;

window.abrirEditarExercicio =
    abrirEditarExercicio;

window.fecharModalEditarExercicio =
    fecharModalEditarExercicio;

window.removerImagemEdicao =
    removerImagemEdicao;

window.excluirExercicio =
    excluirExercicio;

window.abrirTreino =
    abrirTreino;

window.abrirModalAdicionarExercicio =
    abrirModalAdicionarExercicio;

window.fecharModalAdicionarExercicio =
    fecharModalAdicionarExercicio;

window.selecionarExercicioParaTreino =
    selecionarExercicioParaTreino;

window.fecharModalConfigurarExercicio =
    fecharModalConfigurarExercicio;

window.abrirEditarTreinoExercicio =
    abrirEditarTreinoExercicio;

window.fecharModalEditarTreinoExercicio =
    fecharModalEditarTreinoExercicio;

window.listarOpcoesExercicios =
    listarOpcoesExercicios;


/* =========================================================
   INICIAR
========================================================= */

migrarDadosAntigos();

atualizarTreinos();
atualizarResumo();


/*
O Firebase verifica se existe uma sessão
já autenticada no aparelho.
*/

onAuthStateChanged(
    auth,
    async usuario => {

        if (usuario) {

            usuarioAtual = usuario;

            console.log(
                "Usuário conectado:",
                usuario.email
            );

            await carregarExerciciosFirebase();

        } else {

            usuarioAtual = null;

            exercicios = [];

            atualizarExercicios();
            atualizarResumo();

            console.log(
                "Nenhum usuário conectado."
            );

        }

    }
);