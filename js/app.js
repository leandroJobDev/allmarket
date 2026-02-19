const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
const API_URL = isLocal ? "http://localhost:8080" : "https://allmarket-api.onrender.com";

function verificarSessao() {
    if (isLocal && !localStorage.getItem("user_email")) {
        localStorage.setItem("user_email", "dev@localhost.com");
        localStorage.setItem("user_name", "Dev Local");
    }
    const email = localStorage.getItem("user_email");
    if (email) {
        document.getElementById("app-content").classList.remove("hidden");
        document.getElementById("login-gate").classList.add("hidden");
        const nav = document.getElementById("nav-auth");
        if (nav) {
            nav.innerHTML = `<span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">${email}</span>
                             <button onclick="sair()" class="ml-2 text-xs text-red-500 font-bold uppercase">Sair</button>`;
        }
    }
}

const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

async function enviarNota() {
    const url = document.getElementById("urlNota").value;
    const email = localStorage.getItem("user_email");
    if (!url) return Swal.fire("Ops", "Cole a URL da nota!", "warning");

    Swal.fire({ title: 'Processando...', didOpen: () => Swal.showLoading() });

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

            // 1. Mostrar container de resultado
            document.getElementById("res").classList.remove("hidden");

            // 2. Preencher Loja e Endereço
            document.getElementById("loja").innerText = nota.estabelecimento.nome;
            document.getElementById("estEndereco").innerText = nota.estabelecimento.endereco;
            document.getElementById("info-nota").innerText = `Nº ${nota.numero} | EMISSÃO: ${nota.data_emissao}`;

            // 3. ACHAR A CHAVE (Mesmo sem ID no HTML)
            // Procura a tag <code> que contém o texto de aviso e troca pela chave real
            const codes = document.getElementsByTagName("code");
            for (let i = 0; i < codes.length; i++) {
                if (codes[i].innerText.includes("Verifique") || codes[i].innerText.length > 20) {
                    codes[i].innerText = nota.chave;
                }
            }

            // 4. Preencher Itens
            const tbody = document.getElementById("itens");
            tbody.innerHTML = nota.itens.map(i => `
                <tr class="hover:bg-gray-50 transition-colors">
                    <td class="p-5 text-sm">
                        <span class="block font-black text-gray-800 uppercase">${i.nome}</span>
                        <span class="text-[10px] text-gray-400">QTD: ${i.quantidade} | UNIT: ${formatarMoeda(i.preco_unitario)}</span>
                    </td>
                    <td class="p-5 text-right font-black text-blue-600">
                        ${formatarMoeda(i.preco_total)}
                    </td>
                </tr>
            `).join('');

            if (r.status === 409) Swal.fire("Nota já cadastrada", "Dados carregados do histórico.", "info");
        }
    } catch (e) {
        Swal.fire("Erro", "Falha ao conectar no servidor.", "error");
    }
}

function sair() { localStorage.clear(); location.reload(); }
verificarSessao();