document.onreadystatechange = x => {
    const alertButton = document.getElementById('alert-button');
    if (alertButton) {
        alertButton.addEventListener('click', () => {
            alert('You clicked the button, this code is coming from custom.js')
        })
    }
}