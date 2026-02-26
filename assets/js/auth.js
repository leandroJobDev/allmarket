window.CLIENT_ID = "570724598871-n23jsilb8ncvfv2ve6b848q327fgdav9.apps.googleusercontent.com";

window.handleCredentialResponse = (response) => {
    const data = JSON.parse(window.atob(response.credential.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    localStorage.setItem("user_email", data.email);
    localStorage.setItem("user_name", data.name);
    localStorage.setItem("user_picture", data.picture);
    window.location.reload();
};

window.iniciarLoginGoogle = () => {
    if (typeof google === "undefined" || !google.accounts) {
        setTimeout(window.iniciarLoginGoogle, 200);
        return;
    }

    google.accounts.id.initialize({
        client_id: window.CLIENT_ID,
        callback: window.handleCredentialResponse,
        ux_mode: 'popup',
        use_fedcm_for_prompt: false
    });

    const btnContainer = document.getElementById("google-btn-container");
    if (btnContainer) {
        google.accounts.id.renderButton(btnContainer, {
            theme: "outline",
            size: "large",
            shape: "pill",
            width: 280,
            locale: "pt_BR"
        });
    }
};

window.toggleUserDropdown = () => {
    const dropdown = document.getElementById("dropdown-perfil");
    if (dropdown) {
        dropdown.classList.toggle("hidden");
    }
};

window.sair = () => {
    localStorage.clear();
    window.location.reload();
};