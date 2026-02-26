window.verificarSessao = () => {
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");
    const pic = localStorage.getItem("user_picture");

    const loginScreen = document.getElementById("login-screen");
    const appContent = document.getElementById("app-content");
    const mainNav = document.getElementById("main-nav");

    if (email) {
        loginScreen?.classList.add("hidden");
        appContent?.classList.remove("hidden");
        mainNav?.classList.remove("hidden");

        const userPic = document.getElementById("user-pic-desktop");
        const userName = document.getElementById("user-name-desktop");
        if (userPic) userPic.src = pic;
        if (userName) userName.innerText = name ? name.split(' ')[0] : "";
        
        const dropName = document.getElementById("dropdown-full-name");
        const dropEmail = document.getElementById("dropdown-email");
        if (dropName) dropName.innerText = name;
        if (dropEmail) dropEmail.innerText = email;

        window.carregarHistorico();
    } else {
        loginScreen?.classList.remove("hidden");
        appContent?.classList.add("hidden");
        mainNav?.classList.add("hidden");
        if (window.iniciarLoginGoogle) window.iniciarLoginGoogle();
    }
};

window.addEventListener('load', window.verificarSessao);