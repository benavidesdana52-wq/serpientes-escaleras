const tablero = document.getElementById("tablero")
const dado = document.getElementById("dado")
const mensaje = document.getElementById("mensaje")
const turnoTexto = document.getElementById("turno")

const pos1Texto = document.getElementById("pos1")
const pos2Texto = document.getElementById("pos2")

const serpientes = {
    98: 78,
    95: 56,
    88: 24,
    62: 18,
    48: 26
}

const escaleras = {
    3: 22,
    8: 30,
    28: 84,
    58: 77,
    75: 96
}

let jugadores = [1, 1]
let turno = 0
let jugando = true

function crearTablero() {

    tablero.innerHTML = ""

    for (let i = 100; i >= 1; i--) {

        const casilla = document.createElement("div")

        casilla.classList.add("casilla")

        casilla.id = `casilla-${i}`

        const numero = document.createElement("div")
        numero.classList.add("numero")
        numero.textContent = i

        casilla.appendChild(numero)

        if (serpientes[i]) {
            casilla.classList.add("serpiente")
            casilla.innerHTML += "🐍"
        }

        if (escaleras[i]) {
            casilla.classList.add("escalera")
            casilla.innerHTML += "🪜"
        }

        tablero.appendChild(casilla)
    }

    dibujarJugadores()
}

function dibujarJugadores() {

    document.querySelectorAll(".ficha").forEach(f => f.remove())

    jugadores.forEach((pos, index) => {

        const casilla = document.getElementById(`casilla-${pos}`)

        const ficha = document.createElement("div")

        ficha.classList.add("ficha")
        ficha.classList.add(index === 0 ? "ficha1" : "ficha2")

        casilla.appendChild(ficha)
    })

    pos1Texto.textContent = jugadores[0]
    pos2Texto.textContent = jugadores[1]
}

function lanzarDado() {

    if (!jugando) return

    const valor = Math.floor(Math.random() * 6) + 1

    dado.textContent = valor

    let nuevaPos = jugadores[turno] + valor

    if (nuevaPos > 100) {
        nuevaPos = 100
    }

    jugadores[turno] = nuevaPos

    mensaje.textContent = `Jugador ${turno + 1} avanzó ${valor}`

    if (serpientes[nuevaPos]) {

        jugadores[turno] = serpientes[nuevaPos]

        mensaje.textContent = `🐍 ¡Serpiente! Baja a ${jugadores[turno]}`
    }

    if (escaleras[nuevaPos]) {

        jugadores[turno] = escaleras[nuevaPos]

        mensaje.textContent = `🪜 ¡Escalera! Sube a ${jugadores[turno]}`
    }

    dibujarJugadores()

    if (jugadores[turno] === 100) {

        mensaje.textContent = `🎉 ¡Ganó el Jugador ${turno + 1}!`

        jugando = false

        return
    }

    turno = 1 - turno

    turnoTexto.textContent = `Turno Jugador ${turno + 1}`
}

crearTablero()

dado.addEventListener("click", lanzarDado)