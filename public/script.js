function api (){
    fetch('https://lokkeroom-test1.herokuapp.com/')
    .then(res => res.json())
    .then(data => {
        console.log(data)
    }   )       
}
