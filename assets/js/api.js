window.todasAsNotas = [];
const isLocal = window.location.hostname === "127.0.0.1" || window.location.hostname === "localhost";
window.API_URL = isLocal ? "http://127.0.0.1:8080" : "https://allmarket-api.onrender.com";

window.carregarHistorico = async () => {
    const email = localStorage.getItem("user_email");
    if (!email) return;

    try {
        const response = await fetch(`${window.API_URL}/historico?email=${email}`);
        if (!response.ok) throw new Error("Erro ao carregar dados");

        let notas = await response.json();

        window.todasAsNotas = Array.isArray(notas) ? notas.filter(n => n.chave && n.chave !== "") : [];

        const welcomeCard = document.getElementById("welcome-card");
        const abasNavegacao = document.getElementById("abas-navegacao");
        const historicoSec = document.getElementById("historicoSec");

        if (window.todasAsNotas.length > 0) {
            document.getElementById("welcome-card")?.classList.add("hidden");
            document.getElementById("abas-navegacao")?.classList.remove("hidden");
            document.getElementById("historicoSec")?.classList.remove("hidden");
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
        console.error(e);
        document.getElementById("welcome-card")?.classList.remove("hidden");
        document.getElementById("abas-navegacao")?.classList.add("hidden");
        document.getElementById("historicoSec")?.classList.add("hidden");
    }
};

window.enviarNota = async () => {
    const urlInput = document.getElementById("urlNota");
    const url = urlInput?.value.trim();
    const email = localStorage.getItem("user_email");
    const btn = document.getElementById("btnProcessar");

    if (!url) return Swal.fire("Atenção", "Insira a URL da nota.", "warning");
    if (!email) return Swal.fire("Erro", "Usuário não autenticado.", "error");

    btn.disabled = true;
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> PROCESSANDO...';

    try {
        const r = await fetch(`${window.API_URL}/processar`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url, email })
        });

        const data = await r.json();

        if (r.ok || r.status === 409) {
            const nota = data.nota || data;

            if (!nota.itens || nota.itens.length === 0) {
                Swal.fire({
                    title: "Atenção",
                    text: "A SEFAZ solicitou verificação humana (Captcha). Tente abrir a URL no navegador antes de colar aqui.",
                    icon: "warning"
                });
                window.renderizarNota(nota);
                return;
            }

            window.renderizarNota(nota);

            if (r.status === 409) {
                Swal.fire({
                    title: "Nota já cadastrada",
                    text: "Esta nota já existe no seu histórico.",
                    icon: "info",
                    timer: 2000,
                    showConfirmButton: false
                });
            } else if (!window.todasAsNotas.some(n => n.chave === nota.chave)) {
                window.todasAsNotas.unshift(nota);
                if (window.renderizarListaPaginada) window.renderizarListaPaginada();
                if (window.atualizarGraficos) window.atualizarGraficos();
                Swal.fire("Sucesso!", "Nota importada com sucesso.", "success");
            }

            urlInput.value = "";
        } else {
            throw new Error(data.error || "Erro ao processar nota.");
        }
    } catch (e) {
        console.error(e);
        Swal.fire("Erro", e.message || "Erro de conexão com o servidor.", "error");
    } finally {
        btn.disabled = false;
        btn.innerHTML = originalContent;
    }
};

window.excluirNota = async (chave) => {
    if (!chave) return;
    const email = localStorage.getItem("user_email");

    const confirmacao = await Swal.fire({
        title: 'Excluir nota?',
        text: "Essa ação não pode ser desfeita!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
        confirmButtonText: 'Sim, excluir',
        cancelButtonText: 'Cancelar'
    });

    if (confirmacao.isConfirmed) {
        try {
            const response = await fetch(`${window.API_URL}/historico/${chave}?email=${email}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire('Excluído!', 'A nota foi removida com sucesso.', 'success');
                document.getElementById('res')?.classList.add('hidden');
                window.carregarHistorico();
            } else {
                throw new Error('Falha ao excluir');
            }
        } catch (error) {
            Swal.fire('Erro!', 'Não foi possível excluir a nota.', 'error');
            console.error(error);
        }
    }
};