const CLIENT_ID = "570724598871-n23jsilb8ncvfv2ve6b848q327fgdav9.apps.googleusercontent.com";

window.handleCredentialResponse = (response) => {
    const data = JSON.parse(window.atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.name);
    localStorage.setItem("user_picture", data.picture);
    location.reload();
};

async function iniciarLoginGoogle() {
    google.accounts.id.initialize({
        client_id: CLIENT_ID.trim(),
        callback: window.handleCredentialResponse,
        ux_mode: 'popup',
        use_fedcm_for_prompt: false
    });
    google.accounts.id.renderButton(
        document.getElementById("google-btn-container"),
        { theme: "outline", size: "large", shape: "pill", width: 280, locale: "pt_BR" }
    );
}

function sair() { 
    localStorage.clear(); 
    location.reload(); 
}