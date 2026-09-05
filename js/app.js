/* =========================
   DADOS
========================= */

let treinos =
    JSON.parse(localStorage.getItem("treinos")) || [];

let exercicios =
    JSON.parse(localStorage.getItem("exercicios")) || [];

let treinoSelecionado = null;

let exercicioSelecionadoParaAdicionar = null;

let itemTreinoSendoEditado = null;

let exercicioBancoSendoEditado = null;

let imagemSelecionada = "";

let imagemEdicao = "";


/* =========================
   MIGRAÇÃO
========================= */

function migrarDadosAntigos() {

    exercicios.forEach(exercicio => {

        if (!exercicio.grupo) {
            exercicio.grupo = "Outro";
        }

        if (!exercicio.imagem) {
            exercicio.imagem = "";
        }

    });


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

                    const idAntigo = Number(item);

                    const exercicio =
                        exercicios.find(
                            ex => ex.id === idAntigo
                        );


                    return {

                        id:
                            Date.now() +
                            Math.floor(
                                Math.random() * 100000
                            ),

                        exercicioId: idAntigo,

                        carga:
                            exercicio?.carga ?? 20,

                        repeticoes:
                            exercicio?.repeticoes ?? 12,

                        series:
                            exercicio?.series ?? 3

                    };

                }

                return item;

            });

    });


    salvarDados();

}


/* =========================
   NAVEGAÇÃO
========================= */

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

        botoes[mapa[id]]
            .classList.add("menu-ativo");

    }


    if (id === "tela-exercicios") {
        atualizarExercicios();
    }

    if (id === "tela-treinos") {
        atualizarTreinos();
    }

}


/* =========================
   SALVAR
========================= */

function salvarDados() {

    localStorage.setItem(
        "treinos",
        JSON.stringify(treinos)
    );

    localStorage.setItem(
        "exercicios",
        JSON.stringify(exercicios)
    );

    atualizarResumo();

}


/* =========================
   TREINO - MODAL
========================= */

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


/* =========================
   CRIAR TREINO
========================= */

document
    .getElementById("form-treino")
    .addEventListener("submit", function(event) {

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


        if (!nome) {
            return;
        }


        treinos.push({

            id: Date.now(),

            nome,

            descricao,

            exercicios: []

        });


        salvarDados();

        atualizarTreinos();

        fecharModalTreino();

        this.reset();

    });


/* =========================
   NOVO EXERCÍCIO
========================= */

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


/* =========================
   IMAGEM NOVO EXERCÍCIO
========================= */

document
    .getElementById("imagem-exercicio")
    .addEventListener("change", function(event) {

        const arquivo =
            event.target.files[0];


        if (!arquivo) {
            return;
        }


        if (!arquivo.type.startsWith("image/")) {

            alert("Selecione uma imagem válida.");

            this.value = "";

            return;

        }


        const reader =
            new FileReader();


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

    });


/* =========================
   CADASTRAR EXERCÍCIO
========================= */

document
    .getElementById("form-exercicio")
    .addEventListener("submit", function(event) {

        event.preventDefault();


        const nome =
            document
                .getElementById("nome-exercicio")
                .value
                .trim();


        const grupo =
            document
                .getElementById("grupo-exercicio")
                .value;


        if (!nome || !grupo) {
            return;
        }


        exercicios.push({

            id: Date.now(),

            nome,

            grupo,

            imagem: imagemSelecionada

        });


        salvarDados();

        atualizarExercicios();

        fecharModalExercicio();

        this.reset();

        imagemSelecionada = "";

    });


/* =========================
   MOSTRAR BANCO
========================= */

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


/* =========================
   EDITAR EXERCÍCIO DO BANCO
========================= */

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


    /*
    A imagem começa sendo a atual.
    Se o usuário não escolher outra,
    ela será mantida.
    */

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


/* =========================
   PREVIEW DA EDIÇÃO
========================= */

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

    }

    else {

        imagem.removeAttribute("src");

        container.classList.remove("ativo");

        botaoRemover.style.display =
            "none";

    }

}


/* =========================
   TROCAR IMAGEM NA EDIÇÃO
========================= */

document
    .getElementById(
        "editar-exercicio-imagem"
    )
    .addEventListener(
        "change",
        function(event) {

            const arquivo =
                event.target.files[0];


            if (!arquivo) {
                return;
            }


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


/* =========================
   REMOVER IMAGEM
========================= */

function removerImagemEdicao() {

    imagemEdicao = "";


    document
        .getElementById(
            "editar-exercicio-imagem"
        )
        .value = "";


    atualizarPreviewEdicao();

}


/* =========================
   SALVAR EDIÇÃO DO EXERCÍCIO
========================= */

document
    .getElementById(
        "form-editar-exercicio"
    )
    .addEventListener(
        "submit",
        function(event) {

            event.preventDefault();


            if (!exercicioBancoSendoEditado) {
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


            if (!nome || !grupo) {
                return;
            }


            exercicioBancoSendoEditado.nome =
                nome;

            exercicioBancoSendoEditado.grupo =
                grupo;

            exercicioBancoSendoEditado.imagem =
                imagemEdicao;


            salvarDados();

            atualizarExercicios();

            atualizarTreinos();


            /*
            Caso o usuário esteja editando
            um exercício usado no treino,
            o treino também recebe a
            atualização visual.
            */

            if (treinoSelecionado) {

                atualizarExerciciosDoTreino();

            }


            fecharModalEditarExercicio();

        }
    );


function fecharModalEditarExercicio() {

    document
        .getElementById(
            "modal-editar-exercicio"
        )
        .classList.remove("aberto");


    exercicioBancoSendoEditado =
        null;

    imagemEdicao = "";

}


/* =========================
   EXCLUIR EXERCÍCIO
========================= */

function excluirExercicio(id) {

    const exercicio =
        exercicios.find(
            item => item.id === id
        );


    if (!exercicio) {
        return;
    }


    /*
    Descobrimos quantos treinos utilizam
    o exercício.
    */

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


    const confirmar =
        confirm(mensagem);


    if (!confirmar) {
        return;
    }


    /*
    Remove do banco.
    */

    exercicios =
        exercicios.filter(
            item => item.id !== id
        );


    /*
    Remove de todos os treinos.
    */

    treinos.forEach(treino => {

        treino.exercicios =
            treino.exercicios.filter(
                item =>
                    item.exercicioId !== id
            );

    });


    salvarDados();

    atualizarExercicios();

    atualizarTreinos();


    if (treinoSelecionado) {

        atualizarExerciciosDoTreino();

    }

}


/* =========================
   MOSTRAR TREINOS
========================= */

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


/* =========================
   ABRIR TREINO
========================= */

function abrirTreino(id) {

    treinoSelecionado =
        treinos.find(
            treino =>
                treino.id === id
        );


    if (!treinoSelecionado) {
        return;
    }


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


/* =========================
   MODAL ADICIONAR
========================= */

function abrirModalAdicionarExercicio() {

    if (!treinoSelecionado) {
        return;
    }


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


/* =========================
   LISTAR OPÇÕES
========================= */

function listarOpcoesExercicios() {

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


/* =========================
   SELECIONAR PARA TREINO
========================= */

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


/* =========================
   ADICIONAR AO TREINO
========================= */

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


            salvarDados();

            atualizarTreinos();

            atualizarExerciciosDoTreino();

            fecharModalConfigurarExercicio();


            exercicioSelecionadoParaAdicionar =
                null;

        }
    );


/* =========================
   EXERCÍCIOS DO TREINO
========================= */

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


    treinoSelecionado
        .exercicios
        .forEach(item => {

            const exercicio =
                exercicios.find(
                    ex =>
                        ex.id === item.exercicioId
                );


            if (!exercicio) {
                return;
            }


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

}


/* =========================
   EDITAR CONFIGURAÇÃO NO TREINO
========================= */

function abrirEditarTreinoExercicio(
    itemId
) {

    itemTreinoSendoEditado =
        treinoSelecionado.exercicios.find(
            item =>
                item.id === itemId
        );


    if (!itemTreinoSendoEditado) {
        return;
    }


    const exercicio =
        exercicios.find(
            ex =>
                ex.id ===
                itemTreinoSendoEditado.exercicioId
        );


    if (!exercicio) {
        return;
    }


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


/* =========================
   SALVAR CONFIGURAÇÃO
========================= */

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


            salvarDados();

            atualizarExerciciosDoTreino();

            fecharModalEditarTreinoExercicio();


            itemTreinoSendoEditado = null;

        }
    );


/* =========================
   RESUMO
========================= */

function atualizarResumo() {

    document
        .getElementById(
            "total-treinos"
        )
        .textContent =
        treinos.length;


    document
        .getElementById(
            "total-exercicios"
        )
        .textContent =
        exercicios.length;

}


/* =========================
   FECHAR MODAL CLICANDO FORA
========================= */

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


/* =========================
   INICIAR
========================= */

migrarDadosAntigos();

atualizarTreinos();

atualizarExercicios();

atualizarResumo();