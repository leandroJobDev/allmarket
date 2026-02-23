const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";

const API_URL = isLocal
    ? "http://127.0.0.1:8080"
    : "https://allmarket-api.onrender.com";

const CLIENT_ID = "570724598871-n23jsilb8ncvfv2ve6b848q327fgdav9.apps.googleusercontent.com";

let todasAsNotas = [];
let notasExibidas = 4;

window.handleCredentialResponse = (response) => {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(window.atob(base64));

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
    const navAuth = document.getElementById("nav-auth");

    if (email) {
        loginScreen?.classList.add("hidden");
        appContent?.classList.remove("hidden");
        mainNav?.classList.remove("hidden");

        if (navAuth) {
            navAuth.innerHTML = `
                <div class="flex items-center gap-3 bg-white p-1 pr-4 rounded-full border border-gray-100 shadow-sm">
                    <img src="${pic}" class="w-8 h-8 rounded-full border-2 border-blue-50" onerror="this.src='assets/favicon.svg'">
                    <div class="flex flex-col">
                        <span class="text-[9px] text-gray-400 font-black uppercase tracking-tighter leading-none">Usuário</span>
                        <span class="text-xs font-black text-gray-900 leading-tight">${name.split(' ')[0]}</span>
                    </div>
                    <button onclick="sair()" class="ml-2 text-gray-300 hover:text-red-500 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2.5" stroke="currentColor" class="w-4 h-4">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                        </svg>
                    </button>
                </div>`;
        }
        carregarHistorico();
    } else {
        loginScreen?.classList.remove("hidden");
        appContent?.classList.add("hidden");
        mainNav?.classList.add("hidden");
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

            if (r.status === 409) {
                Swal.fire("Nota já cadastrada", "Mostrando dados salvos..", "info");
            } else {
                Swal.fire("Sucesso!", "Nota importada com sucesso.", "success");
            }

            if (!todasAsNotas.some(n => n.chave === nota.chave)) {
                todasAsNotas.unshift(nota);
                renderizarListaPaginada();
            }
        } else {
            Swal.fire("Erro", data.error || "Erro ao processar", "error");
        }
    } catch (e) {
        console.error(e);
        Swal.fire("Erro", "Servidor offline.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = `CONSULTAR`;
    }
}

function renderizarListaPaginada() {
    const listaHist = document.getElementById('lista-hist');
    const containerVerMais = document.getElementById('container-ver-mais');
    const secaoHist = document.getElementById('historicoSec');
    const contador = document.getElementById('contador-notas');
    const btnAcessar = document.getElementById('btn-acessar-notas');

    secaoHist.classList.remove("hidden");
    const notasParaExibir = todasAsNotas.slice(0, notasExibidas);

    // Mostra o botão se não houver notas, esconde se houver
    if (btnAcessar) {
        btnAcessar.classList.toggle("hidden", todasAsNotas.length > 0);
    }

    if (contador) {
        contador.innerText = `${todasAsNotas.length} ${todasAsNotas.length === 1 ? 'compra salva' : 'compras salvas'}`;
    }

    if (notasParaExibir.length === 0) {
        listaHist.innerHTML = `<div class="col-span-full text-center py-10"><p class="text-gray-400 italic">Sua carteira está vazia.</p></div>`;
        containerVerMais && containerVerMais.classList.add("hidden");
        return;
    }

    listaHist.innerHTML = notasParaExibir.map((nota, index) => `
        <div onclick="exibirDetalhesDoObjeto(${index})" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer flex justify-between items-center group">
            <div class="flex-1 truncate">
                <h4 class="font-black text-gray-800 text-sm truncate uppercase group-hover:text-blue-600 transition-colors">${nota.estabelecimento.nome}</h4>
                <p class="text-[10px] text-gray-400 font-bold">${nota.data_emissao}</p>
            </div>
            <div class="text-right ml-4">
                <span class="block text-blue-600 font-black text-base">${formatarMoeda(nota.valor_total)}</span>
                <span class="text-[8px] text-gray-400 uppercase font-bold">${nota.itens.length} ${nota.itens.length === 1 ? 'item' : 'itens'}</span>
            </div>
        </div>`).join('');

    containerVerMais && containerVerMais.classList.toggle("hidden", todasAsNotas.length <= notasExibidas);
}

async function carregarHistorico() {
    const email = localStorage.getItem("user_email");
    if (!email) return;

    try {
        const response = await fetch(`${API_URL}/historico?email=${email}`);
        let notas = await response.json();

        if (Array.isArray(notas)) {
            todasAsNotas = notas.sort((a, b) => {
                const converterData = (str) => {
                    if (!str) return 0;
                    const [data, hora] = str.split(' ');
                    const [d, m, y] = data.split('/');
                    return new Date(`${y}-${m}-${d}T${hora || '00:00:00'}`);
                };

                return converterData(b.data_emissao) - converterData(a.data_emissao);
            });
        }
        renderizarListaPaginada();
    } catch (error) {
        console.error("Erro ao carregar histórico:", error);
    }
}

function renderizarListaPaginada() {
    const listaHist = document.getElementById('lista-hist');
    const containerVerMais = document.getElementById('container-ver-mais');
    const secaoHist = document.getElementById('historicoSec');
    const contador = document.getElementById('contador-notas');
    const btnAcessar = document.getElementById('btn-acessar-notas');

    secaoHist.classList.remove("hidden");
    const notasParaExibir = todasAsNotas.slice(0, notasExibidas);

    btnAcessar && btnAcessar.classList.toggle("hidden", todasAsNotas.length > 0);

    if (contador) {
        contador.innerText = `${todasAsNotas.length} ${todasAsNotas.length === 1 ? 'compra salva' : 'compras salvas'}`;
    }

    if (notasParaExibir.length === 0) {
        listaHist.innerHTML = `<div class="col-span-full text-center py-10"><p class="text-gray-400 italic">Sua carteira está vazia.</p></div>`;
        containerVerMais && containerVerMais.classList.add("hidden");
        return;
    }

    listaHist.innerHTML = notasParaExibir.map((nota, index) => `
        <div onclick="exibirDetalhesDoObjeto(${index})" class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-95 transition-all cursor-pointer flex justify-between items-center group">
            <div class="flex-1 truncate">
                <h4 class="font-black text-gray-800 text-sm truncate uppercase group-hover:text-blue-600 transition-colors">${nota.estabelecimento.nome}</h4>
                <p class="text-[10px] text-gray-400 font-bold">${nota.data_emissao}</p>
            </div>
            <div class="text-right ml-4">
                <span class="block text-blue-600 font-black text-base">${formatarMoeda(nota.valor_total)}</span>
                <span class="text-[8px] text-gray-400 uppercase font-bold">${nota.itens.length} ${nota.itens.length === 1 ? 'item' : 'itens'}</span>
            </div>
        </div>`).join('');

    containerVerMais && containerVerMais.classList.toggle("hidden", todasAsNotas.length <= notasExibidas);
}

const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function exibirDetalhesDoObjeto(index) {
    renderizarNota(todasAsNotas[index]);
}

function mostrarMaisNotas() {
    notasExibidas += 4;
    renderizarListaPaginada();
}

function filtrarHistorico() {
    const termo = document.getElementById("buscaNota").value.toLowerCase();
    const filtradas = todasAsNotas.filter(nota =>
        nota.estabelecimento.nome.toLowerCase().includes(termo)
    );
    const listaHist = document.getElementById('lista-hist');
    listaHist.innerHTML = filtradas.map((nota) => `
        <div onclick="renderizarNota(${JSON.stringify(nota).replace(/"/g, '&quot;')})" 
             class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-blue-50 transition-all cursor-pointer flex justify-between items-center">
            <div class="flex-1 truncate">
                <h4 class="font-black text-gray-800 text-sm truncate uppercase">${nota.estabelecimento.nome}</h4>
                <p class="text-[10px] text-gray-400 font-bold">${nota.data_emissao}</p>
            </div>
            <div class="text-right ml-4">
                <span class="block text-blue-600 font-black text-base">${formatarMoeda(nota.valor_total)}</span>
            </div>
        </div>`).join('');
}

function fecharHistorico() {
    document.getElementById('historicoSec').classList.add('hidden');
    const btnAcessar = document.getElementById('btn-acessar-notas');
    if (btnAcessar) {
        btnAcessar.classList.remove('hidden');
    }
}

function sair() {
    localStorage.clear();
    location.reload();
}

window.onload = () => {
    verificarSessao();
};