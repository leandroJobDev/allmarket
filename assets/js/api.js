window.todasAsNotas = [];
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
window.API_URL = isLocal ? "http://127.0.0.1:8080" : "https://allmarket-api.onrender.com";

window.carregarHistorico = async () => {
    const email = localStorage.getItem("user_email");
    if (!email) return;
    try {
        const response = await fetch(`${window.API_URL}/historico?email=${email}`);
        let notas = await response.json();
        window.todasAsNotas = Array.isArray(notas) ? notas : [];
        
        const welcomeCard = document.getElementById("welcome-card");
        const abasNavegacao = document.getElementById("abas-navegacao");
        const historicoSec = document.getElementById("historicoSec");

        if (window.todasAsNotas.length > 0) {
            window.todasAsNotas.sort((a, b) => {
                const parse = (s) => {
                    if (!s) return 0;
                    const [d, h] = s.split(' ');
                    const [dia, mes, ano] = d.split('/');
                    return new Date(`${ano}-${mes}-${dia}T${h || '00:00:00'}`).getTime();
                };
                return parse(b.data_emissao) - parse(a.data_emissao);
            });
            
            welcomeCard?.classList.add("hidden");
            abasNavegacao?.classList.remove("hidden");
            historicoSec?.classList.remove("hidden");
        } else {
            welcomeCard?.classList.remove("hidden");
            abasNavegacao?.classList.add("hidden");
            historicoSec?.classList.add("hidden");
        }

        if (window.renderizarListaPaginada) window.renderizarListaPaginada();
        if (window.atualizarGraficos) window.atualizarGraficos(); 
    } catch (e) {
        document.getElementById("welcome-card")?.classList.remove("hidden");
        document.getElementById("abas-navegacao")?.classList.add("hidden");
        document.getElementById("historicoSec")?.classList.add("hidden");
    }
};