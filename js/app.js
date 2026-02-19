const API_URL = "https://allmarket-api.onrender.com";

function parseJwt(token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(window.atob(base64));
}

function handleCredentialResponse(response) {
    const userData = parseJwt(response.credential);
    localStorage.setItem("user_email", userData.email);
    localStorage.setItem("user_name", userData.name);
    
    fetch(`${API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: response.credential })
    }).then(() => verificarSessao());
}

function verificarSessao() {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    if (isLocalhost) {
        if (!localStorage.getItem("user_email")) {
            localStorage.setItem("user_email", "dev@localhost.com");
            localStorage.setItem("user_name", "Desenvolvedor Local");
        }
    }

    const email = localStorage.getItem("user_email");
    if (email) {
        const loginGate = document.getElementById("login-gate");
        const appContent = document.getElementById("app-content");
        const navAuth = document.getElementById("nav-auth") || document.getElementById("nav-auth-section");

        if (loginGate) loginGate.style.display = "none";
        if (appContent) appContent.style.display = "block";
        
        if (navAuth) {
            navAuth.innerHTML = `
                <span class="badge bg-light text-dark p-2">${email}</span>
                <a href="#" onclick="sair()" class="text-danger ms-2" style="text-decoration:none">
                    <i class="bi bi-box-arrow-right"></i> Sair
                </a>`;
        }
    }
}

async function enviarNota() {
    const url = document.getElementById("urlNota").value;
    const email = localStorage.getItem("user_email");
    if(!url) return Swal.fire("Ops", "Cole o link da nota!", "warning");

    Swal.fire({title: 'Lendo Nota...', allowOutsideClick: false, didOpen: () => Swal.showLoading()});
    
    try {
        const r = await fetch(`${API_URL}/processar`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({url, email})
        });
        const nota = await r.json();
        Swal.close();

        if (r.ok || r.status === 409) {
            document.getElementById("res").style.display = "block";
            document.getElementById("loja").innerText = nota.estabelecimento.nome;
            document.getElementById("info-nota").innerText = `Data: ${nota.data_emissao} | Total: R$ ${nota.valor_total.toFixed(2)}`;
            document.getElementById("itens").innerHTML = nota.itens.map(i => `
                <tr>
                    <td>${i.nome}</td>
                    <td class="text-end fw-bold">R$ ${i.preco_total.toFixed(2)}</td>
                </tr>
            `).join('');
            if(r.status === 409) Swal.fire("Nota duplicada", "Essa nota já estava no seu histórico.", "info");
        } else {
            Swal.fire("Erro", nota.error || "Erro desconhecido", "error");
        }
    } catch(e) { Swal.fire("Erro", "Servidor offline ou erro de conexão", "error"); }
}

async function carregarHistorico() {
    const email = localStorage.getItem("user_email");
    const container = document.getElementById("lista-hist");
    container.innerHTML = '<div class="text-center p-5"><div class="spinner-border text-primary"></div></div>';

    try {
        const res = await fetch(`${API_URL}/historico?email=${email}`);
        const notas = await res.json();
        
        if (notas.length === 0) {
            container.innerHTML = '<p class="text-center p-5">Nenhuma nota salva.</p>';
            return;
        }

        container.innerHTML = notas.map(n => `
            <div class="col-md-4 mb-3">
                <div class="card p-3 h-100 border-start border-primary border-4 shadow-sm">
                    <div class="fw-bold text-truncate">${n.estabelecimento.nome}</div>
                    <small class="text-muted">${n.data_emissao}</small>
                    <div class="mt-2 fw-bold text-primary">R$ ${n.valor_total.toFixed(2)}</div>
                    <small class="text-muted mt-1">${n.itens.length} itens</small>
                </div>
            </div>
        `).join('');
    } catch(e) { container.innerHTML = '<p class="text-danger text-center">Erro ao carregar histórico.</p>'; }
}

function sair() { localStorage.clear(); location.reload(); }
window.onload = verificarSessao;