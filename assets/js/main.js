var removerPalavras = /SUPERMERCADOS?|MERCADOS?|ATACADISTA|COMERCIO|LTDA|S\/A/gi;
var notasExibidas = 8;

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
    const originalContent = btn.innerHTML;
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
                if (window.atualizarGraficos) window.atualizarGraficos();
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
        btn.innerHTML = originalContent;
    }
}

function renderizarListaPaginada() {
    const welcomeCard = document.getElementById('welcome-card');
    const listaHist = document.getElementById('lista-hist');
    const containerVerMais = document.getElementById('container-ver-mais');
    const secaoHist = document.getElementById('historicoSec');
    const contador = document.getElementById('contador-notas');
    const template = document.getElementById('template-nota');

    if (!listaHist) return;
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
        contador.innerHTML = `<span class="animate-pulse text-blue-500">●</span> ${todasAsNotas.length} ${todasAsNotas.length === 1 ? 'compra salva' : 'compras salvas'}`;
    }

    const notasParaExibir = todasAsNotas.slice(0, notasExibidas);

    notasParaExibir.forEach((nota, index) => {
        const clone = template.content.cloneNode(true);

        const nomeLimpo = nota.estabelecimento.nome
            .replace(removerPalavras, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();

        clone.querySelector('.nota-nome').innerText = nomeLimpo || nota.estabelecimento.nome;
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

    const nomeLimpoDestaque = nota.estabelecimento.nome
        .replace(removerPalavras, '')
        .replace(/\s+/g, ' ')
        .trim()
        .toUpperCase();

    document.getElementById("loja").innerText = nomeLimpoDestaque;
    document.getElementById("estEndereco").innerText = nota.estabelecimento.endereco;
    document.getElementById("info-nota").innerText = `Nº ${nota.numero} | EMISSÃO: ${nota.data_emissao}`;

    const chaveElemento = document.getElementById("chave-acesso");
    if (chaveElemento) chaveElemento.innerText = nota.chave.replace(/(.{4})/g, '$1 ');

    tbody.innerHTML = "";
    nota.itens.forEach(i => {
        const clone = templateItem.content.cloneNode(true);

        let qtdOriginal = parseFloat(i.quantidade);
        let qtdCorrigida = (qtdOriginal === 0.1) ? 1.0 : qtdOriginal;

        clone.querySelector('.item-nome').innerText = i.nome;
        clone.querySelector('.item-detalhes').innerText = `QTD: ${qtdCorrigida.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 3 })} | UNIT: ${formatarMoeda(i.preco_unitario)}`;
        clone.querySelector('.item-valor').innerText = formatarMoeda(i.preco_total || i.valor_total);
        
        tbody.appendChild(clone);
    });

    setTimeout(() => resDiv.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);

    const btnRemover = document.getElementById("btnRemoverNota");
    if (btnRemover) btnRemover.onclick = () => confirmarRemocao(nota.chave);
}

function filtrarHistorico() {
    const termo = document.getElementById("buscaNota").value.toLowerCase();
    const listaHist = document.getElementById('lista-hist');
    const template = document.getElementById('template-nota');

    const notasFiltradas = todasAsNotas.filter(nota =>
        nota.estabelecimento.nome.toLowerCase().includes(termo)
    );

    listaHist.innerHTML = '';

    if (notasFiltradas.length === 0) {
        listaHist.innerHTML = '<p class="text-center text-gray-400 py-10 col-span-full font-bold uppercase text-[10px] tracking-widest">Nenhuma nota encontrada</p>';
        return;
    }

    notasFiltradas.slice(0, notasExibidas).forEach((nota) => {
        const clone = template.content.cloneNode(true);

        const nomeLimpoBusca = nota.estabelecimento.nome
            .replace(removerPalavras, '')
            .replace(/\s+/g, ' ')
            .trim()
            .toUpperCase();

        clone.querySelector('.nota-nome').innerText = nomeLimpoBusca || nota.estabelecimento.nome;
        clone.querySelector('.nota-data').innerText = nota.data_emissao;
        clone.querySelector('.nota-valor').innerText = formatarMoeda(nota.valor_total);
        clone.querySelector('.nota-itens').innerText = `${nota.itens.length} itens`;

        const indexOriginal = todasAsNotas.findIndex(n => n.chave === nota.chave);
        clone.querySelector('div').onclick = () => exibirDetalhesDoObjeto(indexOriginal);
        listaHist.appendChild(clone);
    });
}

function exibirDetalhesDoObjeto(index) {
    if (todasAsNotas[index]) renderizarNota(todasAsNotas[index]);
}

function mostrarMaisNotas() {
    notasExibidas += 8;
    renderizarListaPaginada();
}

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

    if (isConfirmed) {
        const email = localStorage.getItem("user_email");
        try {
            const r = await fetch(`${API_URL}/historico/${chave}?email=${email}`, { method: "DELETE" });
            if (r.ok) {
                Swal.fire("Removida!", "A nota foi excluída.", "success");
                document.getElementById('res').classList.add('hidden');
                todasAsNotas = todasAsNotas.filter(n => n.chave !== chave);
                renderizarListaPaginada();
                if (window.atualizarGraficos) window.atualizarGraficos();
            }
        } catch (e) { console.error(e); }
    }
}

function alternarSecao(secao) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active', 'bg-white', 'shadow-sm', 'text-blue-600');
        b.classList.add('text-gray-500');
    });

    const secaoAtiva = document.getElementById(`secao-${secao}`);
    if (secaoAtiva) secaoAtiva.classList.remove('hidden');

    const btnAtivo = document.getElementById(`btn-${secao}`);
    if (btnAtivo) {
        btnAtivo.classList.add('active', 'bg-white', 'shadow-sm', 'text-blue-600');
        btnAtivo.classList.remove('text-gray-500');
    }

    if (secao === 'analise' && typeof window.atualizarGraficos === 'function') {
        window.atualizarGraficos();
    }
}
window.onload = verificarSessao;