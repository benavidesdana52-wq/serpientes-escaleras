// =====================================================
// UTILIDADES PARA ÁLGEBRA LINEAL
// =====================================================

/**
 * Invierte una matriz usando Gauss-Jordan
 */
function invertirMatriz(matriz) {
    const n = matriz.length;
    const copia = matriz.map(fila => [...fila]);
    const inversa = Array.from({ length: n }, (_, i) => 
        Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
    );

    for (let i = 0; i < n; i++) {
        let pivot = i;
        for (let j = i + 1; j < n; j++) {
            if (Math.abs(copia[j][i]) > Math.abs(copia[pivot][i])) {
                pivot = j;
            }
        }

        [copia[i], copia[pivot]] = [copia[pivot], copia[i]];
        [inversa[i], inversa[pivot]] = [inversa[pivot], inversa[i]];

        if (Math.abs(copia[i][i]) < 1e-10) continue;

        const divisor = copia[i][i];
        for (let j = 0; j < n; j++) {
            copia[i][j] /= divisor;
            inversa[i][j] /= divisor;
        }

        for (let j = 0; j < n; j++) {
            if (i === j) continue;
            const factor = copia[j][i];
            for (let k = 0; k < n; k++) {
                copia[j][k] -= factor * copia[i][k];
                inversa[j][k] -= factor * inversa[i][k];
            }
        }
    }

    return inversa;
}

/**
 * Multiplica dos matrices
 */
function multiplicarMatrices(A, B) {
    const resultado = Array.from({ length: A.length }, () => Array(B[0].length).fill(0));
    for (let i = 0; i < A.length; i++) {
        for (let j = 0; j < B[0].length; j++) {
            for (let k = 0; k < B.length; k++) {
                resultado[i][j] += A[i][k] * B[k][j];
            }
        }
    }
    return resultado;
}

/**
 * Crea la matriz de identidad
 */
function matrizIdentidad(n) {
    return Array.from({ length: n }, (_, i) => 
        Array.from({ length: n }, (_, j) => i === j ? 1 : 0)
    );
}

/**
 * Suma dos matrices
 */
function sumarMatrices(A, B) {
    return A.map((fila, i) => fila.map((val, j) => val + B[i][j]));
}

/**
 * Multiplica una matriz por un escalar
 */
function multiplicarPorEscalar(matriz, escalar) {
    return matriz.map(fila => fila.map(val => val * escalar));
}
