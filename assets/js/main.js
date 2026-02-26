window.verificarSessao = () => {
    const email = localStorage.getItem("user_email");
    const name = localStorage.getItem("user_name");
    const pic = localStorage.getItem("user_picture");

    const loginScreen = document.getElementById("login-screen");
    const appContent = document.getElementById("app-content");
    const mainNav = document.getElementById("main-nav");
    const loader = document.getElementById('loading-screen'); 

    if (email) {
        loginScreen?.classList.add("hidden");
        appContent?.classList.remove("hidden");
        mainNav?.classList.remove("hidden");

        const userPicMob = document.getElementById("user-pic-mob");
        if (userPicMob) userPicMob.src = pic;
        const userPic = document.getElementById("user-pic-desktop");
        const userName = document.getElementById("user-name-desktop");
        if (userPic) userPic.src = pic;
        if (userName) userName.innerText = name ? name.split(' ')[0] : "";

        const dropName = document.getElementById("dropdown-full-name");
        const dropEmail = document.getElementById("dropdown-email");
        if (dropName) dropName.innerText = name;
        if (dropEmail) dropEmail.innerText = email;

        window.carregarHistorico();

        setTimeout(() => {
            if (loader) {
                loader.classList.add('opacity-0');
                setTimeout(() => loader.remove(), 500);
            }
        }, 1500);

    } else {
        loginScreen?.classList.remove("hidden");
        appContent?.classList.add("hidden");
        mainNav?.classList.add("hidden");
        
        loader?.remove(); 
        
        if (window.iniciarLoginGoogle) window.iniciarLoginGoogle();
    }
};

window.addEventListener('load', window.verificarSessao);