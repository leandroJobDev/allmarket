let barChartInstance = null;
let pieChartInstance = null;

const coresApp = ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

window.atualizarGraficos = function () {
    const dashboard = document.getElementById('dashboard');
    const totalDisplay = document.getElementById('total-geral-dashboard');

    if (typeof todasAsNotas === 'undefined' || todasAsNotas.length === 0) {
        return;
    }

    dashboard?.classList.remove('hidden');

    const dadosMensais = {};
    const dadosLojas = {};
    let somaTotal = 0;

    const removerPalavras = /SUPERMERCADOS?|MERCADOS?|ATACADISTA|COMERCIO|LTDA|S\/A/gi;

    todasAsNotas.forEach(nota => {
        const dataPartes = nota.data_emissao.split(' ')[0].split('/');
        const mesAno = `${dataPartes[1]}/${dataPartes[2]}`;

        somaTotal += nota.valor_total;
        dadosMensais[mesAno] = (dadosMensais[mesAno] || 0) + nota.valor_total;

        let nomeLimpo = nota.estabelecimento.nome
            .replace(removerPalavras, '')
            .trim()
            .split(' ')[0]
            .toUpperCase();

        if (!nomeLimpo) nomeLimpo = "OUTROS";

        // CORREÇÃO AQUI: Usando nomeLimpo consistentemente
        dadosLojas[nomeLimpo] = (dadosLojas[nomeLimpo] || 0) + nota.valor_total;
    });

    if (totalDisplay) {
        totalDisplay.innerText = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(somaTotal);
    }

    renderizarBarras(dadosMensais);
    renderizarPizza(dadosLojas);
};

function renderizarBarras(dados) {
    const ctx = document.getElementById('barChart')?.getContext('2d');
    if (!ctx) return;
    if (barChartInstance) barChartInstance.destroy();
    barChartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                data: Object.values(dados),
                backgroundColor: '#2563eb',
                borderRadius: 12
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { beginAtZero: true, grid: { color: '#f3f4f6' } },
                x: { grid: { display: false }, ticks: { font: { size: 10, weight: 'bold' } } }
            }
        }
    });
}

function renderizarPizza(dados) {
    const ctx = document.getElementById('pieChart')?.getContext('2d');
    if (!ctx) return;
    if (pieChartInstance) pieChartInstance.destroy();
    pieChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(dados),
            datasets: [{
                data: Object.values(dados),
                backgroundColor: coresApp,
                borderWidth: 4,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20, font: { size: 11, weight: 'bold' } }
                }
            }
        }
    });
}