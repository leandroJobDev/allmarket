const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
const API_URL = isLocal ? "http://127.0.0.1:8080" : "https://allmarket-api.onrender.com";

const formatarMoeda = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

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
        if (window.atualizarGraficos) window.atualizarGraficos(); 
    } catch (e) {
        console.error(e);
        renderizarListaPaginada();
    }
}