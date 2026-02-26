window.removerPalavras = /SUPERMERCADOS?|MERCADOS?|ATACADISTA|COMERCIO|LTDA|S\/A/gi;
window.notasExibidas = 8;

window.alternarSecao = (secao) => {
    document.querySelectorAll('.tab-content').forEach(s => s.classList.add('hidden'));
    
    const secaoAtiva = document.getElementById(`secao-${secao}`);
    if (secaoAtiva) {
        secaoAtiva.classList.remove('hidden');
    }

    if (secao === 'lista') {
        if (typeof window.gerarSugestoesDeCompras === 'function') {
            window.gerarSugestoesDeCompras();
        }
    }
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

window.adicionarItemLista = () => {
    const input = document.getElementById('input-lista');
    const container = document.getElementById('lista-compras-container');
    const template = document.getElementById('template-item-lista');
    const listaVazia = document.getElementById('lista-vazia');

    const texto = input.value.trim();

    if (texto === "") {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Digite algo para comprar!',
            confirmButtonColor: '#2563eb'
        });
        return;
    }

    if (listaVazia) listaVazia.classList.add('hidden');

    const novoItem = template.content.cloneNode(true);

    novoItem.querySelector('.item-texto').innerText = texto;

    novoItem.querySelector('.btn-remover-item').onclick = function(e) {
        e.target.closest('li').remove();
        if (container.children.length === 0) {
            listaVazia.classList.remove('hidden');
        }
        atualizarContadorLista();
    };

    container.prepend(novoItem);

    input.value = "";
    input.focus();
    atualizarContadorLista();
};

function atualizarContadorLista() {
    const total = document.querySelectorAll('#lista-compras-container li').length;
    const contador = document.getElementById('contador-lista');
    if (contador) contador.innerText = `${total} ${total === 1 ? 'item' : 'itens'}`;
}
document.getElementById('input-lista')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        window.adicionarItemLista();
    }
});

window.gerarSugestoesDeCompras = (filtroMercado = 'TODOS') => {
    const containerItens = document.getElementById('sugestoes-container');
    const containerMercados = document.getElementById('filtro-mercados-container');
    
    if (!window.todasAsNotas || window.todasAsNotas.length === 0) {
        if (containerMercados) containerMercados.innerHTML = '<span class="text-[10px] p-2 text-gray-400">Carregando notas...</span>';
        return;
    }

    let contagemItens = {};
    let mercadosEncontrados = new Set();

    window.todasAsNotas.forEach((nota) => {
        let nomeLoja = "OUTROS";
        
        if (nota.estabelecimento && nota.estabelecimento.nome) {
            nomeLoja = nota.estabelecimento.nome.toUpperCase().trim();
        } else if (nota.loja) {
            nomeLoja = nota.loja.toUpperCase().trim();
        }
        
        mercadosEncontrados.add(nomeLoja);

        if (filtroMercado === 'TODOS' || filtroMercado === nomeLoja) {
            if (nota.itens && Array.isArray(nota.itens)) {
                nota.itens.forEach(item => {
                    const nomeItem = (item.nome || "ITEM").toUpperCase().trim();
                    contagemItens[nomeItem] = (contagemItens[nomeItem] || 0) + 1;
                });
            }
        }
    });

    if (containerMercados) {
        containerMercados.innerHTML = '';
        const listaMercados = ['TODOS', ...Array.from(mercadosEncontrados).sort()];

        listaMercados.forEach(loja => {
            const btn = document.createElement('button');
            const isActive = filtroMercado === loja;
            
            btn.className = `btn-filtro-mercado text-[10px] font-black px-4 py-2 rounded-full whitespace-nowrap transition-all flex-shrink-0 ${
                isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-500 border border-gray-200'
            }`;
            
            btn.innerText = loja;
            btn.onclick = () => window.gerarSugestoesDeCompras(loja);
            containerMercados.appendChild(btn);
        });
    }

    if (containerItens) {
        containerItens.innerHTML = '';
        const ordenados = Object.keys(contagemItens)
            .sort((a, b) => contagemItens[b] - contagemItens[a])
            .slice(0, 30);

        if (ordenados.length === 0) {
            containerItens.innerHTML = '<div class="text-center py-10 text-gray-400 text-[10px] font-bold">Nenhum item encontrado</div>';
            return;
        }

        ordenados.forEach(nome => {
            const btn = document.createElement('button');
            btn.className = "flex items-center justify-between w-full bg-gray-50 hover:bg-blue-50 border border-gray-100 p-3 rounded-xl mb-1 active:scale-[0.98] transition-all";
            
            btn.innerHTML = `
                <div class="flex items-center gap-3 overflow-hidden pointer-events-none">
                    <div class="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100 flex-shrink-0">
                        <i class="fa-solid fa-plus text-blue-600 text-[10px]"></i>
                    </div>
                    <span class="text-[11px] font-bold text-gray-700 uppercase truncate text-left">${nome}</span>
                </div>
                <span class="text-[9px] font-black text-gray-400 bg-white px-2 py-1 rounded-md border border-gray-50 flex-shrink-0 ml-2">${contagemItens[nome]}x</span>
            `;
            
            btn.onclick = () => {
                const input = document.getElementById('input-lista');
                if (input) {
                    input.value = nome;
                    window.adicionarItemLista();
                    btn.classList.add('bg-green-100', 'border-green-300');
                    setTimeout(() => btn.classList.remove('bg-green-100', 'border-green-300'), 300);
                }
            };
            containerItens.appendChild(btn);
        });
    }
};