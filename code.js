const parentSize = 500
const button = document.getElementById('button')
const filePicker = document.getElementById('FileChooser')
const image = document.getElementById('image')
const imageParent = document.getElementById('containerImage')
const alerta = document.querySelector('.alert')
const information = document.querySelector('.image-data')
const hideImage = document.getElementById('hideImage')
button.addEventListener('click', e => {
    filePicker.click()
})
let persons = []
const spanishMoods = {
    anger: 'Enfadado',
    contempt: 'Desprecio',
    disgust: 'Disgustado',
    fear: 'Asustado',
    happiness: 'Feliz',
    neutral:'Neutral',
    sadness: 'Triste',
    surprise: 'Sorprendido'
}
function changePerson(i) {
    const scores = persons[i].scores
    const rectangles = document.getElementsByClassName('rectangle')
    for (const iterator of rectangles) {
        iterator.classList.remove('active')
    }
    // document.getElementById(`rectangle${i}`).classList.add('active')
    let state = null
    let puntaje = 0
    for (const key in scores) {
        if(scores[key] > puntaje) {
            state = key
            puntaje = scores[key]
        }
    }
    document.getElementById('emotion').innerHTML = spanishMoods[state]
}
filePicker.addEventListener('change', async () => {
    deleteAllRectangles()
    persons = await request()
    document.getElementById('numberPersons').innerHTML = persons.length
    alerta.classList.remove('show')
    information.classList.remove('show')
    const base64 = await readImage(false)
    image.src = base64
    if(persons.length){
        image.onload = function () {
            information.classList.add('show')   
            for (const [index, person] of persons.entries()) {
                const rectangleArea = person.faceRectangle
                const rectangle = document.createElement('div')
                rectangle.classList.add('rectangle')
                rectangle.style.top = scaleSize(rectangleArea.top) + 'px'
                rectangle.style.left = scaleSize(rectangleArea.left) + 'px'
                rectangle.style.width = scaleSize(rectangleArea.width) + 'px'
                rectangle.style.height = scaleSize(rectangleArea.height) + 'px'
                rectangle.addEventListener('click', (e) => {
                    changePerson(index)
                    e.target.classList.add('active')
                })
                imageParent.appendChild(rectangle)
            }
            changePerson(0)
        }
    } else {
        alerta.classList.remove('no-image')
        alerta.classList.add('error')
        alerta.classList.add('show')
        alerta.innerHTML = 'No se encontraron caras en tu imagen'
    }
})
function deleteAllRectangles() {
    const rectangles = document.getElementsByClassName('rectangle')
    for (let i = rectangles.length; i > 0; i--) {
        rectangles[i-1].parentNode.removeChild(rectangles[i-1])
    }
}
const scaleSize = (size) => size * parentSize / image.naturalWidth;
function readImage(buffer){
    const fr = new FileReader()
    return new Promise((resolve, reject) =>{
        if (buffer) {
            fr.readAsArrayBuffer(filePicker.files[0])
        } else fr.readAsDataURL(filePicker.files[0])
        fr.onload = function() {
            resolve(this.result)
        }
    })
}
async function request() {
    let headers = new Headers()
    headers.append('Content-Type', 'application/octet-stream')
    headers.append('Ocp-Apim-Subscription-Key','2920add485ae439d9c044e9be1fec10c')
    const file = filePicker.files[0]
    let body = await readImage(true)
    let data = await fetch('https://westus.api.cognitive.microsoft.com/emotion/v1.0/recognize', {
        method: 'POST',
        headers,
        body
    })
    data = await data.json()
    return data
}