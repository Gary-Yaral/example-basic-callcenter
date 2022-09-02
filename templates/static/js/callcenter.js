// importamos la libreria para calcular la edad
import { calculateYear } from "./calculateAge.js"

// Seleccioamos el contenedor de la fecha
const time = document.querySelector('.time')
// Seleccionamos el boton de buscar
const search = document.querySelector('.btn-search')
// Seleccioamos el input de la cedula
const dni = document.querySelector('.search')
// Seleccionamos el contenedor del resultado de la busqueda
const result = document.querySelector('.content-data')
// CSeleccionamos el contenedor de la tabla
const tableContainer = document.querySelector('.container-block')
// Seleccionamos el label del mensaje
const message = document.querySelector('.message')
// Creamos una instacia de la fecha
let dateNow = new Date()
// Creamos un objeto que contenga los meses en español
let months = {
    "1": "enero",
    "2": "febrero",
    "3": "marzo",
    "4": "abril", 
    "5": "mayo",
    "6": "junio",
    "7": "julio",
    "8": "agosto",
    "9": "septiembre",
    "10": "octubre",
    "11": "noviembre",
    "12": "diciembre"
}

// Extraemos el mes el día y el año
let month = dateNow.getMonth() + 1 // sumamos 1 por siempre devuelve el mes anterior
let date = dateNow.getDate()
let year = dateNow.getFullYear()

// Insertamso la fecha en su contenedor
time.innerHTML = `Ecuador, ${date} de ${months[month]} del ${year}`

// Añadimos un evento click para el boton de buscar
search.onclick = () => {
    // Gurdamos el valor que tiene el input de la cedula
    let value = dni.value
    // Validamos que sea una cedula
    let isValid = /^([\d]{10})$/.test(value)
    // Verificamos que haya 10 caracteres
    if(isValid) {
        // Enviamos la cedula para buscar en la bd
        $.post("/", {dni: value}, (response) => {
            // Seleccionamos el tbody
            let tbody = tableContainer.querySelector('tbody')

            if(response) {
                // Contamos el número total de hijos
                let children = response.children.length
                // Concatenamos los servicios básicos
                let services = ""
                // Calculamos el ultimo indice del arreglo de servicios
                let servLength = response.b_services.length - 1
                response.b_services.forEach((elem, index) => {
                    if(index !== servLength) {
                        // Concatenamos con coma
                        services += elem + ", "
                    } else {
                        // Concatenamos sin coma
                        services += elem
                    }
                });

                // Contamos los hijos menores a 5 años
                let childrenUnder5 = 0
                let childrenUnder18 = 0
                response.children.forEach(child => {
                    // Transformamos la fecha a un formato legible
                    let date = child.born.split("/")
                    // Eset es el formato para validar 2022-01-12
                    let formatedDate = `${date[2]}-${date[1]}-${date[0]}`
                    // Calculamos la edad de cada hijo
                    let age = calculateYear(formatedDate)
                    // Cantamos los hijos que son menores a 5 años
                    if(age < 5) {
                        childrenUnder5++
                    } 
                    // Contamos los hijos entre 5 y 18 años
                    if(age >= 5 && age < 18) {
                        childrenUnder18++
                    }
                })

                // Calculamos el valor del bono a percibir
                let bonus = verifyBeneficiary(
                    response.salary, 
                    childrenUnder5, 
                    childrenUnder18
                )

                // Seleccionamos el contenedor del mensage si es beneficiario
                let msg = document.querySelector('.result')
                // Verificamos si el bonus es mayor a 0 
                if(bonus > 0) {
                    // Rellenamos el mensaje 
                    msg.innerHTML = "Es beneficiario del bono de desarrollo humano"
                    // Le quitamos la clase de color rojo en caso de tenerla
                    msg.classList.remove("text-danger")
                    // le añadimos una clase de color verde
                    msg.classList.add("text-success")
                } else {
                    // Relleanamos el mensaje
                    msg.innerHTML = "No es beneficiario del bono de desarrollo humano"
                    // Le quitamos la clase de color verde en caso de tenerla
                    msg.classList.remove("text-success")
                    // Le añadimos la clase de color rojo
                    msg.classList.add("text-danger")
                }

                // Creamos y añadimos la fila de la tabla
                // Esta fila tiene los datos del usuario encontrado
                tbody.innerHTML = `
                <tr>
                    <th scope="row" class="text-center">1</th>
                    <td class="text-center">${response.dni}</td>
                    <td>${response.name}</td>
                    <td class="text-center">${response.born}</td>
                    <td class="text-center">${response.status}</td>
                    <td>${response.couple}</td>
                    <td class="text-center">${children}</td>
                    <td class="text-center">${childrenUnder5}</td>
                    <td class="text-center">${childrenUnder18}</td>
                    <td class="text-center">${response.salary.toFixed(2)}</td>
                    <td class="text-center">${response.sector}</td>
                    <td class="text-center">${response.education}</td>
                    <td class="text-center">${services}</td>
                    <td class="text-center">${bonus}</td>
                </tr>
                `
                // quitamos la clase hidden para que se muestra la tabla
                tableContainer.classList.remove('hidden')
                // Ocultamos el mensaje de "Sin resultados"
                message.classList.add("hidden")
            } else {
                // Mostramos el mesanje "Sin resultados"
                message.classList.remove("hidden")
                // Limpiamos el tbody quitando el contenido
                tbody.innerHTML = ""
                // Ocultamos la tabla
                tableContainer.classList.add('hidden')
            }
        })
    } else {
        // Si se intenta enviar número con más o menos digitos mostrará error
        // success, warning, error
        Swal.fire("¡Atención!", "Numero de cédula no es válido", "warning")
    }
}

// Valida si es o no beneficiario  del bono
function verifyBeneficiary(salary, childrenUnder5, childrenUnder18) {
    let bonus = 0
    let hasChildren = childrenUnder18 > 0 || childrenUnder5 > 0

    // Esto es para el bono en general
    if(salary < 425) {
        if(hasChildren) {
            bonus = 55
        }
    }

    // Esto sirve para validar que tenga 3 hijos menores de 5 años
    if(childrenUnder5 >= 3) {
        let first = 27
        let second = 24.30
        let third =   24.30
        bonus = 55
        bonus += first
        bonus += second
        bonus += third

    }

    // Añadimos dos decimales usando el metodo toFixed(2)
    return bonus.toFixed(2)
}