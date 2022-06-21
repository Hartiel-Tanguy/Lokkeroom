//route pour aller sur la page d'accueil si nom et mot de passe sont bon

//redirect vers une autre page html si le nom et le mot de passe sont bon
function login() {
    var username = document.getElementById("username").value;
    var password = document.getElementById("password").value;
    if (username == "admin" && password == "admin") {
        window.location.href = "index.html";
    } else {
        alert("Wrong username and/or password");
    }
}




