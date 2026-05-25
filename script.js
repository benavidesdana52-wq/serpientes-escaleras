// =====================================================
// VARIABLES GLOBALES
// =====================================================

const FIN = 100;
const FILAS = 10;
const COLUMNAS = 10;

let serpientes = {};
let escaleras = {};
let SALTOS = {};
let tEsperados = [0, 0];

let jugadores = [1, 1];
let turno = 0;
let jugando = false;
let juego_terminado = false;
let ultimo_dado = 0;

let modoActual = 'configuracion';
let cantSerpientes = 5;
let cantEscaleras = 5;
let serpientesCreadas = 0;
let escalersCreadas = 0;
let primerClick = null; // Para almacenar la primera casilla seleccionada

// =====================================================
// ELEMENTOS DEL DOM
// =====================================================

const modoConfiguracion = document.getElementById('modoConfiguracion');
const modoJuego = document.getElementById('modoJuego');
const tableroConfig = document.getElementById('tableroConfig');
const tableroJuego = document.getElementById('tablero');
const dadoBtn = document.getElementById('dado');
const btnComenzar = document.getElementById('btnComenzar');
const btnVolver = document.getElementById('btnVolver');

const cantSerpientesInput = document.getElementById('cantSerpientes');
const cantEscalerasInput = document.getElementById('cantEscaleras');
const estadoTexto = document.getElementById('estado');
const detallesTexto = document.getElementById('detalles');

const turnoTexto = document.getElementById('turno');
const mensajeTexto = document.getElementById('mensaje');
const pos1Texto = document.getElementById('pos1');
const pos2Texto = document.getElementById('pos2');
const turnosJ1 = document.getElementById('turnosJ1');
const turnosJ2 = document.getElementById('turnosJ2');

// =====================================================
// FUNCIONES DE CONFIGURACIÓN
// =====================================================

function obtenerPosicion(num) {
    num -= 1;
    const fila_desde_abajo = Math.floor(num / COLUMNAS);
    let fila = FILAS - 1 - fila_desde_abajo;
    let col = num % COLUMNAS;

    if (fila_desde_abajo % 2 === 1) {
        col = COLUMNAS - 1 - col;
    }

    return { fila, col };
}

function crearTableroConfig() {
    tableroConfig.innerHTML = '';
    
    for (let i = 1; i <= FIN; i++) {
        const casilla = document.createElement('div');
        casilla.classList.add('casilla-config');
        casilla.id = `casilla-config-${i}`;
        casilla.textContent = i;
        casilla.addEventListener('click', () => seleccionarCasilla(i));
        tableroConfig.appendChild(casilla);
    }
}

function seleccionarCasilla(numCasilla) {
    const casilla = document.getElementById(`casilla-config-${numCasilla}`);
    const esSerpiente = serpientesCreadas < cantSerpientes;
    const tipo = esSerpiente ? 'Serpiente' : 'Escalera';
    const numTipo = esSerpiente ? serpientesCreadas + 1 : escalersCreadas + 1;

    if (primerClick === null) {
        // Primer click: seleccionar casilla
        primerClick = { numero: numCasilla, esSerpiente };
        casilla.classList.add('seleccionada');
        detallesTexto.textContent = `Seleccionaste casilla ${numCasilla}. Ahora elige la segunda casilla.`;
    } else {
        // Segundo click: confirmar o cancelar
        const esMismoTipo = primerClick.esSerpiente === esSerpiente;
        const esValido = esMismoTipo && primerClick.numero !== numCasilla;

        if (!esValido) {
            detallesTexto.textContent = '❌ Selección inválida. Intenta nuevamente.';
            document.getElementById(`casilla-config-${primerClick.numero}`).classList.remove('seleccionada');
            primerClick = null;
            return;
        }

        // Validaciones específicas
        if (primerClick.esSerpiente) {
            if (primerClick.numero <= numCasilla) {
                detallesTexto.textContent = '❌ En una serpiente, la cabeza debe ser mayor que la cola.';
                document.getElementById(`casilla-config-${primerClick.numero}`).classList.remove('seleccionada');
                primerClick = null;
                return;
            }
            if (primerClick.numero >= FIN || numCasilla <= 1) {
                detallesTexto.textContent = '❌ Casillas inválidas. La cabeza no puede ser 100 y la cola debe ser mayor a 1.';
                document.getElementById(`casilla-config-${primerClick.numero}`).classList.remove('seleccionada');
                primerClick = null;
                return;
            }
            serpientes[primerClick.numero] = numCasilla;
            serpientesCreadas++;
        } else {
            if (numCasilla <= primerClick.numero) {
                detallesTexto.textContent = '❌ En una escalera, el final debe ser mayor que el inicio.';
                document.getElementById(`casilla-config-${primerClick.numero}`).classList.remove('seleccionada');
                primerClick = null;
                return;
            }
            if (primerClick.numero <= 1 || numCasilla > FIN) {
                detallesTexto.textContent = '❌ Casillas inválidas. El inicio debe ser mayor a 1 y el final no puede superar 100.';
                document.getElementById(`casilla-config-${primerClick.numero}`).classList.remove('seleccionada');
                primerClick = null;
                return;
            }
            escaleras[primerClick.numero] = numCasilla;
            escalersCreadas++;
        }

        SALTOS = { ...serpientes, ...escaleras };
        
        // Actualizar UI
        marcarCasillasCreadas();
        document.getElementById(`casilla-config-${primerClick.numero}`).classList.remove('seleccionada');
        primerClick = null;

        // Actualizar estado
        if (serpientesCreadas < cantSerpientes) {
            estadoTexto.textContent = `Serpiente ${serpientesCreadas + 1} - Click en casilla ALTA`;
            detallesTexto.textContent = `Serpientes: ${serpientesCreadas}/${cantSerpientes} | Escaleras: ${escalersCreadas}/${cantEscaleras}`;
        } else if (escalersCreadas < cantEscaleras) {
            estadoTexto.textContent = `Escalera ${escalersCreadas + 1} - Click en casilla BAJA`;
            detallesTexto.textContent = `Serpientes: ${serpientesCreadas}/${cantSerpientes} | Escaleras: ${escalersCreadas}/${cantEscaleras}`;
        } else {
            estadoTexto.textContent = '✅ ¡Configuración completa!';
            detallesTexto.textContent = 'Todas las serpientes y escaleras han sido creadas.';
            btnComenzar.disabled = false;
        }
    }
}

function marcarCasillasCreadas() {
    Object.entries(serpientes).forEach(([cabeza, cola]) => {
        document.getElementById(`casilla-config-${cabeza}`).classList.add('serpiente');
        document.getElementById(`casilla-config-${cola}`).classList.add('serpiente');
    });
    Object.entries(escaleras).forEach(([inicio, final]) => {
        document.getElementById(`casilla-config-${inicio}`).classList.add('escalera');
        document.getElementById(`casilla-config-${final}`).classList.add('escalera');
    });
}

// =====================================================
// FUNCIONES DE ÁLGEBRA LINEAL
// =====================================================

function construirMatrizTransicion() {
    const mT = Array(FIN + 1).fill(null).map(() => Array(FIN + 1).fill(0));

    for (let i = 1; i <= FIN; i++) {
        if (i === FIN) {
            mT[FIN][FIN] = 1.0;
            continue;
        }

        for (let dado = 1; dado <= 6; dado++) {
            let s = Math.min(i + dado, FIN);
            s = SALTOS[s] || s;
            mT[i][s] += 1 / 6;
        }
    }

    return mT;
}

function calcularTurnosEsperados() {
    const mT = construirMatrizTransicion();
    
    // P = matriz sin la última fila (estado absorbente)
    const P = [];
    for (let i = 1; i < FIN; i++) {
        P[i - 1] = mT[i].slice(1, FIN);
    }

    // Q = submatriz sin el estado absorbente
    const Q = [];
    for (let i = 0; i < FIN - 1; i++) {
        Q[i] = P[i].slice(0, FIN - 1);
    }

    // I = matriz identidad
    const I = matrizIdentidad(FIN - 1);

    // I - Q
    const IQ = sumarMatrices(I, multiplicarPorEscalar(Q, -1));

    // N = (I - Q)^-1
    const N = invertirMatriz(IQ);

    // Turnos esperados = suma de cada fila de N
    const turnos = N.map(fila => fila.reduce((a, b) => a + b, 0));

    return turnos;
}

// =====================================================
// FUNCIONES DE JUEGO
// =====================================================

function crearTableroJuego() {
    tableroJuego.innerHTML = '';

    for (let i = FIN; i >= 1; i--) {
        const casilla = document.createElement('div');
        casilla.classList.add('casilla');
        casilla.id = `casilla-${i}`;

        const numero = document.createElement('div');
        numero.classList.add('numero');
        numero.textContent = i;
        casilla.appendChild(numero);

        if (serpientes[i]) {
            casilla.classList.add('serpiente');
            casilla.innerHTML += '🐍';
        } else if (escaleras[i]) {
            casilla.classList.add('escalera');
            casilla.innerHTML += '🪜';
        }

        tableroJuego.appendChild(casilla);
    }

    dibujarJugadores();
}

function dibujarJugadores() {
    document.querySelectorAll('.ficha').forEach(f => f.remove());

    jugadores.forEach((pos, index) => {
        const casilla = document.getElementById(`casilla-${pos}`);
        const ficha = document.createElement('div');
        ficha.classList.add('ficha');
        ficha.classList.add(index === 0 ? 'ficha1' : 'ficha2');
        casilla.appendChild(ficha);
    });

    pos1Texto.textContent = jugadores[0];
    pos2Texto.textContent = jugadores[1];
    
    actualizarTurnosEsperados();
}

function actualizarTurnosEsperados() {
    const t1 = jugadores[0] === FIN ? 0 : tEsperados[jugadores[0] - 2] || 0;
    const t2 = jugadores[1] === FIN ? 0 : tEsperados[jugadores[1] - 2] || 0;

    turnosJ1.textContent = t1.toFixed(1);
    turnosJ2.textContent = t2.toFixed(1);
}

function lanzarDado() {
    if (!jugando || juego_terminado) return;

    const valor = Math.floor(Math.random() * 6) + 1;
    ultimo_dado = valor;
    dadoBtn.textContent = valor;

    let nuevaPos = Math.min(jugadores[turno] + valor, FIN);

    jugadores[turno] = nuevaPos;

    mensajeTexto.textContent = `Jugador ${turno + 1} avanzó ${valor}`;

    if (serpientes[nuevaPos]) {
        jugadores[turno] = serpientes[nuevaPos];
        mensajeTexto.textContent = `🐍 ¡Serpiente! Baja a ${jugadores[turno]}`;
    } else if (escaleras[nuevaPos]) {
        jugadores[turno] = escaleras[nuevaPos];
        mensajeTexto.textContent = `🪜 ¡Escalera! Sube a ${jugadores[turno]}`;
    }

    dibujarJugadores();

    if (jugadores[turno] === FIN) {
        mensajeTexto.textContent = `🎉 ¡Ganó el Jugador ${turno + 1}!`;
        juego_terminado = true;
        jugando = false;
        return;
    }

    turno = 1 - turno;
    turnoTexto.textContent = `Turno Jugador ${turno + 1}`;
}

// =====================================================
// EVENTOS
// =====================================================

cantSerpientesInput.addEventListener('change', (e) => {
    cantSerpientes = parseInt(e.target.value);
});

cantEscalerasInput.addEventListener('change', (e) => {
    cantEscaleras = parseInt(e.target.value);
});

btnComenzar.addEventListener('click', () => {
    // Calcular turnos esperados
    tEsperados = calcularTurnosEsperados();
    
    // Cambiar modo
    modoConfiguracion.classList.remove('modo-activo');
    modoConfiguracion.classList.add('modo-inactivo');
    modoJuego.classList.remove('modo-inactivo');
    modoJuego.classList.add('modo-activo');

    // Crear tablero y empezar
    jugadores = [1, 1];
    turno = 0;
    jugando = true;
    juego_terminado = false;

    crearTableroJuego();
    turnoTexto.textContent = 'Turno Jugador 1';
    mensajeTexto.textContent = 'Presiona el dado para iniciar';
});

dadoBtn.addEventListener('click', lanzarDado);

btnVolver.addEventListener('click', () => {
    // Resetear
    serpientes = {};
    escaleras = {};
    SALTOS = {};
    serpientesCreadas = 0;
    escalersCreadas = 0;
    primerClick = null;
    jugadores = [1, 1];
    turno = 0;
    jugando = false;
    juego_terminado = false;

    // Cambiar modo
    modoJuego.classList.remove('modo-activo');
    modoJuego.classList.add('modo-inactivo');
    modoConfiguracion.classList.remove('modo-inactivo');
    modoConfiguracion.classList.add('modo-activo');

    // Recrear tablero de configuración
    crearTableroConfig();
    btnComenzar.disabled = true;
    estadoTexto.textContent = 'Serpiente 1 - Click en casilla ALTA';
    detallesTexto.textContent = '';
});

// =====================================================
// INICIALIZACIÓN
// =====================================================

crearTableroConfig();
