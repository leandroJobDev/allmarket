const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL = isLocal ? "http://localhost:8080" : "https://allmarket-api.onrender.com";

let todasAsNotas = [];
let notasExibidas = 4;

window.handleCredentialResponse = (response) => {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(window.atob(base64));

    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.name);
    location.reload();
};

async function configurarGoogleLogin() {
    try {
        const r = await fetch(`${API_URL}/config`);
        const config = await r.json();
        
        if (config.google_client_id) {
            google.accounts.id.initialize({
                client_id: config.google_client_id,
                callback: window.handleCredentialResponse,
                auto_prompt: false,
                itp_support: true
            });
            google.accounts.id.renderButton(
                document.querySelector(".g_id_signin"),
                { theme: "outline", size: "large" }
            );
        }
    } catch (e) {
        console.error(e);
    }
}

function verificarSessao() {
    if (isLocal && !localStorage.getItem("user_email")) {
        localStorage.setItem("user_email", "dev@localhost.com");
        localStorage.setItem("user_name", "Dev Local");
    }
    const email = localStorage.getItem("user_email");
    if (email) {
        document.getElementById("app-content")?.classList.remove("hidden");
        document.getElementById("login-gate")?.classList.add("hidden");
        const nav = document.getElementById("nav-auth");
        if (nav) {
            nav.innerHTML = `
                <div class="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span class="text-blue-700 text-xs font-bold">${email}</span>
                    <button onclick="sair()" class="text-[10px] text-red-500 font-black uppercase ml-2 hover:text-red-700">Sair</button>
                </div>`;
        }
        carregarHistorico();
    } else {
        configurarGoogleLogin();
    }
}

const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

async function enviarNota() {
    const url = document.getElementById("urlNota").value;
    const email = localStorage.getItem("user_email");
    const btn = document.getElementById("btnProcessar");
    const statusCont = document.getElementById("statusContainer");

    if (!url) return Swal.fire("Ops", "Cole a URL da nota!", "warning");

    const originalBtnContent = btn.innerHTML;
    btn.disabled = true;
    btn.innerText = "Lendo...";

    Swal.fire({ title: 'Sincronizando...', didOpen: () => Swal.showLoading() });

    try {
        const r = await fetch(`${API_URL}/processar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, email })
        });
        const data = await r.json();
        Swal.close();

        if (r.ok || r.status === 409) {
            const nota = data.nota || data;
            renderizarNota(nota);
            if (r.status === 409) {
                if (statusCont) statusCont.classList.add("hidden");
                Swal.fire("Nota já cadastrada", "Dados carregados da sua carteira.", "info");
            } else {
                if (statusCont) statusCont.classList.remove("hidden");
            }
            carregarHistorico();
        } else {
            Swal.fire("Erro", data.error || "Erro ao processar", "error");
        }
    } catch (e) {
        Swal.fire("Erro", "Falha ao conectar no servidor.");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalBtnContent;
    }
}

function renderizarNota(nota) {
    const resDiv = document.getElementById("res");
    resDiv.classList.remove("hidden");
    document.getElementById("loja").innerText = nota.estabelecimento.nome;
    document.getElementById("estEndereco").innerText = nota.estabelecimento.endereco;
    document.getElementById("info-nota").innerText = `Nº ${nota.numero} | EMISSÃO: ${nota.data_emissao}`;
    const codes = document.getElementsByTagName("code");
    for (let i = 0; i < codes.length; i++) { codes[i].innerText = nota.chave; }
    const tbody = document.getElementById("itens");
    tbody.innerHTML = nota.itens.map(i => `
        <tr class="hover:bg-gray-50 transition-colors">
            <td class="p-5 text-sm">
                <span class="block font-black text-gray-800 uppercase">${i.nome}</span>
                <span class="text-[10px] text-gray-400">QTD: ${i.quantidade} | UNIT: ${formatarMoeda(i.preco_unitario)}</span>
            </td>
            <td class="p-5 text-right font-black text-blue-600">${formatarMoeda(i.preco_total || i.valor_total)}</td>
        </tr>`).join('');
    setTimeout(() => { resDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 150);
}

async function carregarHistorico() {
    const email = localStorage.getItem("user_email");
    if (!email) return;
    try {
        const response = await fetch(`${API_URL}/historico?email=${email}`);
        let notas = await response.json();
        todasAsNotas = notas.sort((a, b) => {
            const dataA = a.data_emissao.split('/').reverse().join('-');
            const dataB = b.data_emissao.split('/').reverse().join('-');
            return dataB.localeCompare(dataA);
        });
        notasExibidas = 4;
        renderizarListaPaginada();
    } catch (error) { console.error(error); }
}

function renderizarListaPaginada() {
    const listaHist = document.getElementById('lista-hist');
    const containerVerMais = document.getElementById('container-ver-mais');
    const secaoHist = document.getElementById('historicoSec');
    const contador = document.getElementById('contador-notas');
    secaoHist.classList.remove("hidden");
    const notasParaExibir = todasAsNotas.slice(0, notasExibidas);
    if (contador) contador.innerText = `${todasAsNotas.length} compras salvas`;
    if (notasParaExibir.length === 0) {
        listaHist.innerHTML = `<p class="col-span-full text-center py-10 text-gray-400 italic">Sua carteira está vazia.</p>`;
        containerVerMais.classList.add("hidden");
        return;
    }
    listaHist.innerHTML = notasParaExibir.map((nota, index) => `
        <div onclick="exibirDetalhesDoObjeto(${index})" 
             class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-blue-50 transition-all cursor-pointer flex justify-between items-center">
            <div class="flex-1 truncate">
                <h4 class="font-black text-gray-800 text-sm truncate uppercase">${nota.estabelecimento.nome}</h4>
                <p class="text-[10px] text-gray-400 font-bold">${nota.data_emissao}</p>
            </div>
            <div class="text-right ml-4">
                <span class="block text-blue-600 font-black text-base">${formatarMoeda(nota.valor_total)}</span>
                <span class="text-[8px] text-gray-400 uppercase tracking-tighter">${nota.itens.length} itens</span>
            </div>
        </div>`).join('');
    if (todasAsNotas.length > notasExibidas) { containerVerMais.classList.remove("hidden"); } 
    else { containerVerMais.classList.add("hidden"); }
}

function mostrarMaisNotas() {
    notasExibidas += 4;
    renderizarListaPaginada();
}

function filtrarHistorico() {
    const termo = document.getElementById("buscaNota").value.toLowerCase();
    const filtradas = todasAsNotas.filter(nota => 
        nota.estabelecimento.nome.toLowerCase().includes(termo) ||
        nota.valor_total.toString().includes(termo)
    );
    const listaHist = document.getElementById('lista-hist');
    const containerVerMais = document.getElementById('container-ver-mais');
    if (filtradas.length === 0) {
        listaHist.innerHTML = `<p class="col-span-full text-center py-10 text-gray-400">Nenhuma compra encontrada.</p>`;
        containerVerMais.classList.add("hidden");
        return;
    }
    listaHist.innerHTML = filtradas.slice(0, notasExibidas).map((nota) => {
        const originalIndex = todasAsNotas.findIndex(n => n === nota);
        return `
        <div onclick="exibirDetalhesDoObjeto(${originalIndex})" 
             class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:bg-blue-50 transition-all cursor-pointer flex justify-between items-center">
            <div class="flex-1 truncate">
                <h4 class="font-black text-gray-800 text-sm truncate uppercase">${nota.estabelecimento.nome}</h4>
                <p class="text-[10px] text-gray-400 font-bold">${nota.data_emissao}</p>
            </div>
            <div class="text-right ml-4">
                <span class="block text-blue-600 font-black text-base">${formatarMoeda(nota.valor_total)}</span>
                <span class="text-[8px] text-gray-400 uppercase tracking-tighter">${nota.itens.length} itens</span>
            </div>
        </div>`;
    }).join('');
}

function exibirDetalhesDoObjeto(index) {
    const nota = todasAsNotas[index];
    const statusCont = document.getElementById("statusContainer");
    if (statusCont) statusCont.classList.add("hidden");
    renderizarNota(nota);
}

function sair() { localStorage.clear(); location.reload(); }
verificarSessao();