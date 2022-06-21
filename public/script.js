function api (){
    fetch('https://lokkeroom-test1.herokuapp.com/')
    .then(res => res.json())
    .then(data => {
        
        let h2 = document.querySelector('h2')
        h2.innerText = data.api.public.lobby.name
    })
    
}

