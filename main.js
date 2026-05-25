// Constantes
const FIN = 100;
const COLUMNAS = 10;

// Estado del juego
let game = {
    serpientes: {},
    escaleras: {},
    jugadores: [1, 1],
    turno: 0,
    jugando: false,
    finalizado: false,
    primerClick: null,
    serpientesCreadas: 0,
    escalersCreadas: 0,
    tEsperados: []
};

// DOM elements
const pantallaConfig = document.getElementById('pantallaConfig');
const pantallaJuego = document.getElementById('pantallaJuego');
const numSerpientesInput = document.getElementById('numSerpientes');
const numEscalerasInput = document.getElementById('numEscaleras');
const tableroConfig = document.getElementById('tableroConfig');
const tableroJuego = document.getElementById('tableroJuego');
const btnIniciar = document.getElementById('btnIniciar');
const btnDado = document.getElementById('btnDado');
const btnVolver = document.getElementById('btnVolver');
const instruccion = document.getElementById('instruccion');
const turnoInfo = document.getElementById('turnoInfo');
const mensajeInfo = document.getElementById('mensajeInfo');
const pos1 = document.getElementById('pos1');
const pos2 = document.getElementById('pos2');
const pred1 = document.getElementById('pred1');
const pred2 = document.getElementById('pred2');

// ============= FUNCIONES DE ÁLGEBRA LINEAL =============

function invertirMatriz(matriz) {
    const n = matriz.length;
    const m = matriz.map(fila => [...fila]);
    const inv = Array.from({length: n}, (_, i) => Array.from({length: n}, (_, j) => i === j ? 1 : 0));
    
    for (let i = 0; i < n; i++) {
        let pivote = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(m[j][i]) > Math.abs(m[pivote][i])) pivote = j;
        }
        
        [m[i], m[pivote]] = [m[pivote], m[i]];
        [inv[i], inv[pivote]] = [inv[pivote], inv[i]];
        
        const divisor = m[i][i];
        if (Math.abs(divisor) < 1e-10) continue;
        
        for (let j = 0; j < n; j++) {
            m[i][j] /= divisor;
            inv[i][j] /= divisor;
        }
        
        for (let j = 0; j < n; j++) {
            if (i !== j) {
                const factor = m[j][i];
                for (let k = 0; k < n; k++) {
                    m[j][k] -= factor * m[i][k];
                    inv[j][k] -= factor * inv[i][k];
                }
            }
        }
    }
    return inv;
}

function calcularTurnosEsperados() {
    const saltos = {...game.serpientes, ...game.escaleras};
    const mT = Array(FIN + 1).fill(0).map(() => Array(FIN + 1).fill(0));
    
    for (let i = 1; i <= FIN; i++) {
        if (i === FIN) {
            mT[FIN][FIN] = 1;
            continue;
        }
        for (let d = 1; d <= 6; d++) {
            let s = Math.min(i + d, FIN);
            s = saltos[s] || s;
            mT[i][s] += 1/6;
        }
    }
    
    const Q = [];
    for (let i = 1; i < FIN; i++) {
        Q[i-1] = mT[i].slice(1, FIN);
    }
    
    const I = Array(FIN-1).fill(0).map((_, i) => Array(FIN-1).fill(0).map((_, j) => i === j ? 1 : 0));
    const IQ = I.map((fila, i) => fila.map((_, j) => I[i][j] - Q[i][j]));
    
    try {
        const N = invertirMatriz(IQ);
        return N.map(fila => fila.reduce((a, b) => a + b, 0));
    } catch (e) {
        console.error('Error:', e);
        return Array(FIN-1).fill(0);
    }
}

// ============= FUNCIONES DE CONFIGURACIÓN =============

function crearTableroConfig() {
    tableroConfig.innerHTML = '';
    for (let i = 1; i <= FIN; i++) {
        const casilla = document.createElement('div');
        casilla.className = 'casilla';
        casilla.textContent = i;
        casilla.id = `config-${i}`;
        casilla.onclick = () => seleccionarCasilla(i);
        tableroConfig.appendChild(casilla);
    }
}

function seleccionarCasilla(num) {
    const numSerp = parseInt(numSerpientesInput.value);
    const numEsc = parseInt(numEscalerasInput.value);
    const esSerpiente = game.serpientesCreadas < numSerp;
    
    if (!game.primerClick) {
        game.primerClick = { num, esSerpiente };
        document.getElementById(`config-${num}`).classList.add('seleccionada');
        instruccion.textContent = `Seleccionaste ${num}. Elige la segunda casilla.`;
        return;
    }
    
    const c1 = game.primerClick.num;
    const esValido = game.primerClick.esSerpiente === esSerpiente && c1 !== num;
    
    if (!esValido) {
        instruccion.textContent = '❌ Selección inválida';
        document.getElementById(`config-${c1}`).classList.remove('seleccionada');
        game.primerClick = null;
        return;
    }
    
    if (esSerpiente) {
        if (c1 <= num || c1 >= FIN || num <= 1) {
            instruccion.textContent = '❌ Serpiente: cabeza > cola';
            document.getElementById(`config-${c1}`).classList.remove('seleccionada');
            game.primerClick = null;
            return;
        }
        game.serpientes[c1] = num;
        game.serpientesCreadas++;
    } else {
        if (num <= c1 || c1 <= 1 || num > FIN) {
            instruccion.textContent = '❌ Escalera: inicio < final';
            document.getElementById(`config-${c1}`).classList.remove('seleccionada');
            game.primerClick = null;
            return;
        }
        game.escaleras[c1] = num;
        game.escalersCreadas++;
    }
    
    marcarCasillas();
    document.getElementById(`config-${c1}`).classList.remove('seleccionada');
    game.primerClick = null;
    
    const total = game.serpientesCreadas + game.escalersCreadas;
    const limite = numSerp + numEsc;
    
    if (total === limite) {
        instruccion.textContent = '✅ ¡Configuración lista!';
        btnIniciar.disabled = false;
    } else {
        instruccion.textContent = `${total}/${limite} completado`;
    }
}

function marcarCasillas() {
    Object.entries(game.serpientes).forEach(([c, cola]) => {
        document.getElementById(`config-${c}`).classList.add('serpiente');
        document.getElementById(`config-${cola}`).classList.add('serpiente');
    });
    Object.entries(game.escaleras).forEach(([i, f]) => {
        document.getElementById(`config-${i}`).classList.add('escalera');
        document.getElementById(`config-${f}`).classList.add('escalera');
    });
}

// ============= FUNCIONES DE JUEGO =============

function crearTableroJuego() {
    tableroJuego.innerHTML = '';
    for (let i = FIN; i >= 1; i--) {
        const casilla = document.createElement('div');
        casilla.className = 'casilla';
        casilla.id = `juego-${i}`;
        
        const num = document.createElement('span');
        num.textContent = i;
        casilla.appendChild(num);
        
        if (game.serpientes[i]) {
            casilla.classList.add('serpiente');
        } else if (game.escaleras[i]) {
            casilla.classList.add('escalera');
        }
        
        tableroJuego.appendChild(casilla);
    }
    dibujarFichas();
}

function dibujarFichas() {
    document.querySelectorAll('.ficha').forEach(f => f.remove());
    
    game.jugadores.forEach((posicion, idx) => {
        const casilla = document.getElementById(`juego-${posicion}`);
        const ficha = document.createElement('div');
        ficha.className = `ficha ${idx === 0 ? 'j1' : 'j2'}`;
        casilla.appendChild(ficha);
    });
    
    pos1.textContent = game.jugadores[0];
    pos2.textContent = game.jugadores[1];
    actualizarPredicciones();
}

function actualizarPredicciones() {
    let t1 = game.tEsperados[game.jugadores[0] - 2] || 0;
    let t2 = game.tEsperados[game.jugadores[1] - 2] || 0;
    
    if (game.jugadores[0] === FIN) t1 = 0;
    if (game.jugadores[1] === FIN) t2 = 0;
    
    pred1.textContent = isFinite(t1) ? t1.toFixed(1) : '0';
    pred2.textContent = isFinite(t2) ? t2.toFixed(1) : '0';
}

function lanzarDado() {
    if (!game.jugando || game.finalizado) return;
    
    const valor = Math.floor(Math.random() * 6) + 1;
    btnDado.textContent = valor;
    
    let nueva = Math.min(game.jugadores[game.turno] + valor, FIN);
    game.jugadores[game.turno] = nueva;
    
    const saltos = {...game.serpientes, ...game.escaleras};
    
    if (saltos[nueva]) {
        game.jugadores[game.turno] = saltos[nueva];
        const tipo = game.serpientes[nueva] ? '🐍' : '🪜';
        mensajeInfo.textContent = `${tipo} ${nueva} → ${saltos[nueva]}`;
    } else {
        mensajeInfo.textContent = `Avanzó ${valor}`;
    }
    
    dibujarFichas();
    
    if (game.jugadores[game.turno] === FIN) {
        mensajeInfo.textContent = `🎉 ¡Ganó Jugador ${game.turno + 1}!`;
        game.finalizado = true;
        game.jugando = false;
        btnDado.disabled = true;
        return;
    }
    
    game.turno = 1 - game.turno;
    turnoInfo.textContent = `Turno: Jugador ${game.turno + 1}`;
}

// ============= EVENTOS =============

btnIniciar.addEventListener('click', () => {
    game.tEsperados = calcularTurnosEsperados();
    
    pantallaConfig.classList.remove('activa');
    pantallaJuego.classList.add('activa');
    
    game.jugadores = [1, 1];
    game.turno = 0;
    game.jugando = true;
    game.finalizado = false;
    
    btnDado.textContent = '🎲';
    btnDado.disabled = false;
    turnoInfo.textContent = 'Turno: Jugador 1';
    mensajeInfo.textContent = '';
    
    crearTableroJuego();
});

btnDado.addEventListener('click', lanzarDado);

btnVolver.addEventListener('click', () => {
    game = {
        serpientes: {},
        escaleras: {},
        jugadores: [1, 1],
        turno: 0,
        jugando: false,
        finalizado: false,
        primerClick: null,
        serpientesCreadas: 0,
        escalersCreadas: 0,
        tEsperados: []
    };
    
    pantallaJuego.classList.remove('activa');
    pantallaConfig.classList.add('activa');
    
    instruccion.textContent = 'Haz click en dos casillas para crear una serpiente o escalera';
    btnIniciar.disabled = true;
    
    crearTableroConfig();
});

// Iniciar
crearTableroConfig();