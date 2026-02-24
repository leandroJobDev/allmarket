const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
const API_URL = isLocal ? "http://127.0.0.1:8080" : "https://allmarket-api.onrender.com";
const CLIENT_ID = "570724598871-n23jsilb8ncvfv2ve6b848q327fgdav9.apps.googleusercontent.com";

let todasAsNotas = [];
let notasExibidas = 8;

window.handleCredentialResponse = (response) => {
    const data = JSON.parse(window.atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.name);
    localStorage.setItem("user_picture", data.picture);
    location.reload();
};

async function iniciarLoginGoogle() {
    google.accounts.id.initialize({
        client_id: CLIENT_ID.trim(),
        callback: window.handleCredentialResponse,
        ux_mode: 'popup',
        use_fedcm_for_prompt: false
    });
    google.accounts.id.renderButton(
        document.getElementById("google-btn-container"),
        { theme: "outline", size: "large", shape: "pill", width: 280, locale: "pt_BR" }
    );
}

function verificarSessao() {
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");
    const pic = localStorage.getItem("user_picture");

    const loginScreen = document.getElementById("login-screen");
    const appContent = document.getElementById("app-content");
    const mainNav = document.getElementById("main-nav");
    const userProfile = document.getElementById("user-profile");

    if (email) {
        loginScreen?.classList.add("hidden");
        appContent?.classList.remove("hidden");
        mainNav?.classList.remove("hidden");

        if (userProfile) {
            userProfile.classList.remove("hidden");
            document.getElementById("user-pic").src = pic;
            document.getElementById("user-name-display").innerText = name.split(' ')[0];
        }

        carregarHistorico();
    } else {
        loginScreen?.classList.remove("hidden");
        appContent?.classList.add("hidden");
        mainNav?.classList.add("hidden");
        userProfile?.classList.add("hidden");

        iniciarLoginGoogle();
    }
}

async function enviarNota() {
    const url = document.getElementById("urlNota").value;
    const email = localStorage.getItem("user_email");
    const btn = document.getElementById("btnProcessar");

    if (!url) return Swal.fire("Atenção", "Insira a URL da nota.", "warning");

    btn.disabled = true;
    btn.innerText = "PROCESSANDO...";

    try {
        const r = await fetch(`${API_URL}/processar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, email })
        });

        const data = await r.json();

        if (r.ok || r.status === 409) {
            const nota = data.nota || data;
            renderizarNota(nota);
            if (r.status !== 409 && !todasAsNotas.some(n => n.chave === nota.chave)) {
                todasAsNotas.unshift(nota);
                renderizarListaPaginada();
                Swal.fire("Sucesso!", "Nota importada com sucesso.", "success");
            }
            document.getElementById("urlNota").value = "";
        } else {
            Swal.fire("Erro", data.error || "Erro ao processar", "error");
        }
    } catch (e) {
        console.error(e);
        Swal.fire("Erro", "Servidor offline.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 md:h-6 md:w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>`;
    }
}

async function carregarHistorico() {
    const email = localStorage.getItem("user_email");
    if (!email) return;
    try {
        const response = await fetch(`${API_URL}/historico?email=${email}`);
        let notas = await response.json();
        if (Array.isArray(notas)) {
            todasAsNotas = notas.sort((a, b) => {
                const parse = (s) => {
                    if (!s) return 0;
                    const [d, h] = s.split(' ');
                    const [dia, mes, ano] = d.split('/');
                    return new Date(`${ano}-${mes}-${dia}T${h || '00:00:00'}`).getTime();
                };
                return parse(b.data_emissao) - parse(a.data_emissao);
            });
        }
        renderizarListaPaginada();
    } catch (e) {
        console.error(e);
        renderizarListaPaginada();
    }
}

function filtrarHistorico() {
    const termo = document.getElementById("buscaNota").value.toLowerCase();
    const listaHist = document.getElementById('lista-hist');
    const template = document.getElementById('template-nota');
    const contador = document.getElementById('contador-notas');

    const notasFiltradas = todasAsNotas.filter(nota =>
        nota.estabelecimento.nome.toLowerCase().includes(termo)
    );

    listaHist.innerHTML = '';

    if (notasFiltradas.length === 0) {
        listaHist.innerHTML = '<p class="text-center text-gray-400 py-10 col-span-full font-bold uppercase text-xs tracking-widest">Nenhuma nota encontrada</p>';
        if (contador) contador.innerText = "Nenhum resultado";
        return;
    }

    notasFiltradas.slice(0, notasExibidas).forEach((nota) => {
        const clone = template.content.cloneNode(true);

        clone.querySelector('.nota-nome').innerText = nota.estabelecimento.nome;
        clone.querySelector('.nota-data').innerText = nota.data_emissao;
        clone.querySelector('.nota-valor').innerText = formatarMoeda(nota.valor_total);
        clone.querySelector('.nota-itens').innerText = `${nota.itens.length} itens`;

        const indexOriginal = todasAsNotas.findIndex(n => n.chave === nota.chave);
        const cardDiv = clone.querySelector('div');
        cardDiv.onclick = () => exibirDetalhesDoObjeto(indexOriginal);

        listaHist.appendChild(clone);
    });

    if (contador) {
        contador.innerText = `${notasFiltradas.length} resultado(s) encontrado(s)`;
    }
}

function renderizarListaPaginada() {
    const welcomeCard = document.getElementById('welcome-card');
    const listaHist = document.getElementById('lista-hist');
    const containerVerMais = document.getElementById('container-ver-mais');
    const secaoHist = document.getElementById('historicoSec');
    const contador = document.getElementById('contador-notas');
    const template = document.getElementById('template-nota');

    listaHist.innerHTML = '';

    if (todasAsNotas.length === 0) {
        welcomeCard?.classList.remove('hidden');
        secaoHist?.classList.add('hidden');
        if (contador) contador.innerText = "Nenhuma compra salva";
        if (containerVerMais) containerVerMais.classList.add("hidden");
        return;
    }

    welcomeCard?.classList.add('hidden');
    secaoHist?.classList.remove('hidden');

    if (contador) {
        contador.innerHTML = `<span class="animate-pulse">●</span> ${todasAsNotas.length} ${todasAsNotas.length === 1 ? 'compra salva' : 'compras salvas'}`;
    }

    const notasParaExibir = todasAsNotas.slice(0, notasExibidas);

    notasParaExibir.forEach((nota, index) => {
        const clone = template.content.cloneNode(true);

        clone.querySelector('.nota-nome').innerText = nota.estabelecimento.nome;
        clone.querySelector('.nota-data').innerText = nota.data_emissao;
        clone.querySelector('.nota-valor').innerText = formatarMoeda(nota.valor_total);
        clone.querySelector('.nota-itens').innerText = `${nota.itens.length} itens`;

        const cardDiv = clone.querySelector('div');
        cardDiv.onclick = () => exibirDetalhesDoObjeto(index);

        listaHist.appendChild(clone);
    });

    if (containerVerMais) {
        containerVerMais.classList.toggle("hidden", todasAsNotas.length <= notasExibidas);
    }
}

function renderizarNota(nota) {
    const resDiv = document.getElementById("res");
    const templateItem = document.getElementById("template-item-nota");
    const tbody = document.getElementById("itens");

    if (!resDiv || !nota || !templateItem) return;

    resDiv.classList.remove("hidden");

    document.getElementById("loja").innerText = nota.estabelecimento.nome;
    document.getElementById("estEndereco").innerText = nota.estabelecimento.endereco;
    document.getElementById("info-nota").innerText = `Nº ${nota.numero} | EMISSÃO: ${nota.data_emissao}`;

    const chaveElemento = document.getElementById("chave-acesso");
    if (chaveElemento) {
        chaveElemento.innerText = nota.chave.replace(/(.{4})/g, '$1 ');
    }

    tbody.innerHTML = "";
    nota.itens.forEach(i => {
        const clone = templateItem.content.cloneNode(true);

        clone.querySelector('.item-nome').innerText = i.nome;
        clone.querySelector('.item-detalhes').innerText = `QTD: ${i.quantidade} | UNIT: ${formatarMoeda(i.preco_unitario)}`;
        clone.querySelector('.item-valor').innerText = formatarMoeda(i.preco_total || i.valor_total);

        tbody.appendChild(clone);
    });

    setTimeout(() => resDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const btnRemover = document.getElementById("btnRemoverNota");
    if (btnRemover) {
        btnRemover.onclick = () => confirmarRemocao(nota.chave);
    }
}

function exibirDetalhesDoObjeto(index) {
    if (todasAsNotas[index]) renderizarNota(todasAsNotas[index]);
}

const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);
function mostrarMaisNotas() { notasExibidas += 4; renderizarListaPaginada(); }
function sair() { localStorage.clear(); location.reload(); }

async function confirmarRemocao(chave) {
    const { isConfirmed } = await Swal.fire({
        title: 'Remover nota?',
        text: "Esta ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, remover',
        cancelButtonText: 'Cancelar'
    });
    if (isConfirmed) removerNota(chave);
}

async function removerNota(chave) {
    const email = localStorage.getItem("user_email");
    try {
        const r = await fetch(`${API_URL}/historico/${chave}?email=${email}`, { method: "DELETE" });
        if (r.ok) {
            Swal.fire("Removida!", "A nota foi excluída com sucesso.", "success");
            document.getElementById('res').classList.add('hidden');
            todasAsNotas = todasAsNotas.filter(n => n.chave !== chave);
            renderizarListaPaginada();
        }
    } catch (e) { console.error(e); }
}

window.onload = verificarSessao;