window.removerPalavras = /SUPERMERCADOS?|MERCADOS?|ATACADISTA|COMERCIO|LTDA|S\/A/gi;
window.notasExibidas = 8;

window.alternarSecao = (secao) => {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById('res')?.classList.add('hidden');

    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('active', 'bg-white', 'shadow-sm', 'text-blue-600');
        b.classList.add('text-gray-500');
    });

    document.querySelectorAll('.nav-item').forEach(b => {
        b.classList.remove('text-blue-600');
        b.classList.add('text-gray-500');
    });

    const secaoAtiva = document.getElementById(`secao-${secao}`);
    if (secaoAtiva) secaoAtiva.classList.remove('hidden');

    // 5. Ativa Botão DESKTOP (Adiciona fundo branco e sombra)
    const btnDesktop = document.getElementById(`btn-${secao}`);
    if (btnDesktop) {
        btnDesktop.classList.add('active', 'bg-white', 'shadow-sm', 'text-blue-600');
        btnDesktop.classList.remove('text-gray-500');
    }

    const btnMobile = document.getElementById(`btn-nav-${secao}`);
    if (btnMobile) {
        btnMobile.classList.add('text-blue-600');
        btnMobile.classList.remove('text-gray-500');
    }

    document.getElementById("dropdown-perfil")?.classList.add("hidden");

    if (secao === 'historico') window.renderizarListaPaginada();
    if (secao === 'analise' && window.atualizarGraficos) window.atualizarGraficos();
};

window.filtrarHistorico = () => {
    const termo = document.getElementById('buscaNota').value.toLowerCase();
    const listaHist = document.getElementById('lista-hist');
    const template = document.getElementById('template-nota');
    
    if (!listaHist || !template) return;
    listaHist.innerHTML = '';

    const notasFiltradas = window.todasAsNotas.filter(nota => 
        nota.estabelecimento.nome.toLowerCase().includes(termo)
    );

    notasFiltradas.slice(0, window.notasExibidas).forEach(nota => {
        const clone = template.content.cloneNode(true);
        const nomeLimpo = nota.estabelecimento.nome.replace(window.removerPalavras, '').trim();
        
        clone.querySelector('.nota-nome').innerText = nomeLimpo;
        clone.querySelector('.nota-data').innerText = nota.data_emissao.split(' ')[0];
        clone.querySelector('.nota-valor').innerText = nota.valor_total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
        clone.querySelector('.nota-itens').innerText = `${nota.itens.length} itens`;
        
        clone.querySelector('div').onclick = () => window.renderizarNota(nota);
        listaHist.appendChild(clone);
    });
};

window.renderizarListaPaginada = () => {
    window.filtrarHistorico();
};

window.renderizarNota = (nota) => {
    const resDiv = document.getElementById("res");
    const tbody = document.getElementById("itens");
    if (!resDiv || !nota) return;

    resDiv.classList.remove("hidden");
    document.getElementById("loja").innerText = (nota.estabelecimento?.nome || "Estabelecimento").replace(window.removerPalavras, '').trim();
    document.getElementById("estEndereco").innerText = nota.estabelecimento?.endereco || "Endereço não informado";

    const dataEmissao = nota.data_emissao || "Data não disponível";
    const valorTotal = nota.valor_total ? nota.valor_total.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : "R$ 0,00";
    document.getElementById("info-nota").innerText = `${dataEmissao} • TOTAL: ${valorTotal}`;
    document.getElementById("chave-acesso").innerText = nota.chave || "Chave não disponível";

    const btnRemover = document.getElementById("btnRemoverNota");
    if (btnRemover) {
        btnRemover.onclick = (e) => {
            e.stopPropagation();
            window.excluirNota(nota.chave);
        };
    }

    if (tbody) {
        tbody.innerHTML = "";
        if (nota.itens && Array.isArray(nota.itens)) {
            nota.itens.forEach(i => {
                const temp = document.getElementById("template-item-nota");
                if (temp) {
                    const clone = temp.content.cloneNode(true);
                    clone.querySelector('.item-nome').innerText = i.nome;
                    const v = (i.preco_total || i.valor_total || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                    clone.querySelector('.item-valor').innerText = v;
                    
                    const det = clone.querySelector('.item-detalhes');
                    if (det) {
                        const pUn = (i.preco_unitario || 0).toLocaleString('pt-br', { style: 'currency', currency: 'BRL' });
                        det.innerText = `${i.quantidade || 1} ${i.unidade || 'UN'} x ${pUn}`;
                    }
                    tbody.appendChild(clone);
                }
            });
        } else {
            tbody.innerHTML = "<tr><td colspan='2' class='p-8 text-center text-gray-500 italic'>Esta nota requer verificação humana ou não possui itens detalhados.</td></tr>";
        }
    }
    resDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
};