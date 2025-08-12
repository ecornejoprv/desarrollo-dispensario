// models/secuencias.model.js (Código Completo)

import { db } from '../database/databasePostgres.js';

export const generarSiguienteNumeroReceta = async (locationId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN'); // Inicia la transacción

        const anioActual = new Date().getFullYear();

        // Bloquea la fila para evitar que otros procesos la lean o modifiquen (previene concurrencia)
        const selectQuery = `
            SELECT sec_ultimo_numero FROM dispensario.secuencias_recetas
            WHERE sec_anio = $1 AND sec_cod_disu = $2 FOR UPDATE;
        `;
        const res = await client.query(selectQuery, [anioActual, locationId]);

        let siguienteNumero;

        if (res.rows.length > 0) {
            // Si ya existe un secuencial para este año y lugar, lo incrementamos.
            siguienteNumero = res.rows[0].sec_ultimo_numero + 1;
            const updateQuery = `
                UPDATE dispensario.secuencias_recetas
                SET sec_ultimo_numero = $1
                WHERE sec_anio = $2 AND sec_cod_disu = $3;
            `;
            await client.query(updateQuery, [siguienteNumero, anioActual, locationId]);
        } else {
            // Si no existe, es el primero del año para este lugar. Empezamos en 1.
            siguienteNumero = 1;
            const insertQuery = `
                INSERT INTO dispensario.secuencias_recetas (sec_anio, sec_cod_disu, sec_ultimo_numero)
                VALUES ($1, $2, $3);
            `;
            await client.query(insertQuery, [anioActual, locationId, siguienteNumero]);
        }

        await client.query('COMMIT'); // Confirma la transacción

        // Formatea el número a 7 dígitos (ej. 0000001)
        return siguienteNumero.toString().padStart(7, '0');

    } catch (error) {
        await client.query('ROLLBACK'); // Si algo falla, revierte todo
        console.error("Error en la transacción de secuencial:", error);
        throw new Error("No se pudo generar el secuencial de la receta.");
    } finally {
        client.release(); // Libera la conexión
    }
};