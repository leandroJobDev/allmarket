// Configurações Globais
const API_URL = "http://127.0.0.1:8080";
let todasAsNotas = [];
let notasExibidas = 4;

// 1. Funções de Autenticação e Google
window.handleCredentialResponse = (response) => {
    const base64Url = response.credential.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const data = JSON.parse(window.atob(base64));
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.name);
    location.reload(); // Recarrega para entrar na área logada
};

async function iniciarLoginGoogle() {
    try {
        console.log("Buscando configurações do servidor...");
        const r = await fetch(`${API_URL}/config`);
        const config = await r.json();
        
        if (config.google_client_id) {
            google.accounts.id.initialize({
                client_id: config.google_client_id,
                callback: window.handleCredentialResponse,
                ux_mode: 'popup',
                use_fedcm_for_prompt: false
            });
            google.accounts.id.renderButton(
                document.getElementById("google-btn-container"),
                { theme: "outline", size: "large", shape: "pill", width: 280 }
            );
        } else {
            console.error("Client ID não encontrado no backend.");
        }
    } catch (e) { 
        console.error("Erro ao conectar com o backend para login:", e); 
    }
}

function verificarSessao() {
    const email = localStorage.getItem("user_email");
    const loginScreen = document.getElementById("login-screen");
    const appContent = document.getElementById("app-content");
    const mainNav = document.getElementById("main-nav");
    const navAuth = document.getElementById("nav-auth");

    if (email) {
        // Usuário Logado
        if (loginScreen) loginScreen.classList.add("hidden");
        if (appContent) appContent.classList.remove("hidden");
        if (mainNav) mainNav.classList.remove("hidden");
        if (navAuth) {
            navAuth.innerHTML = `
                <div class="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span class="text-blue-700 text-xs font-bold">${email}</span>
                    <button onclick="sair()" class="text-[10px] text-red-500 font-black uppercase ml-2 hover:text-red-700">Sair</button>
                </div>`;
        }
        carregarHistorico();
    } else {
        // Usuário Deslogado
        if (loginScreen) loginScreen.classList.remove("hidden");
        if (appContent) appContent.classList.add("hidden");
        if (mainNav) mainNav.classList.add("hidden");
        iniciarLoginGoogle(); // CHAMA A FUNÇÃO CORRETA AQUI
    }
}

// 2. Processamento de Notas
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

            // Atualiza lista local para aparecer na hora no histórico
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

// 3. Renderização e Histórico
function renderizarNota(nota) {
    const resDiv = document.getElementById("res");
    resDiv.classList.remove("hidden");
    
    document.getElementById("loja").innerText = nota.estabelecimento.nome;
    document.getElementById("estEndereco").innerText = nota.estabelecimento.endereco;
    document.getElementById("info-nota").innerText = `Nº ${nota.numero} | EMISSÃO: ${nota.data_emissao}`;
    
    // Atualiza todas as tags <code> com a chave
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

        if (Array.isArray(notas)) {
            todasAsNotas = notas.sort((a, b) => {
                const dataA = a.data_emissao.split('/').reverse().join('-');
                const dataB = b.data_emissao.split('/').reverse().join('-');
                return dataB.localeCompare(dataA);
            });
        }
        renderizarListaPaginada();
    } catch (error) {
        console.error("Erro no histórico:", error);
    }
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

    containerVerMais.classList.toggle("hidden", todasAsNotas.length <= notasExibidas);
}

// 4. Utilitários
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
    // Para simplificar, o filtro mostra todos os resultados da busca
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

function sair() {
    localStorage.clear();
    location.reload();
}

// Inicialização
verificarSessao();