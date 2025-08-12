import { db } from '../database/databasePostgres.js';

/**
 * @summary Lista todas las versiones de evaluación para un paciente.
 * @param {number} pacienteId El ID del paciente.
 * @returns {Promise<Array>} Una lista de las versiones de evaluación. Puede ser un array vacío.
 */
export const listarVersionesPorPaciente = async (pacienteId) => {
    const query = `
        SELECT
            evalost_cod_evalost,
            evalost_fec_eval,
            evalost_es_activo
        FROM dispensario.dmevalost
        WHERE evalost_cod_pacie = $1
        ORDER BY evalost_fec_eval DESC, evalost_cod_evalost DESC;
    `;
    const { rows } = await db.query(query, [pacienteId]);
    
    // --- LÓGICA DE AUTOCREACIÓN ELIMINADA ---
    // Simplemente devolvemos las filas encontradas. Si no hay, será un array vacío.
    return rows;
};

/**
 * @summary Crea una nueva versión de la evaluación, desactivando las anteriores.
 * @description Utiliza una transacción para garantizar la atomicidad de la operación.
 * @param {number} pacienteId El ID del paciente.
 * @returns {Promise<Object>} La nueva evaluación creada.
 */
export const crearNuevaVersion = async (pacienteId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Desactivar todas las versiones anteriores para este paciente
        const updateQuery = `
            UPDATE dispensario.dmevalost
            SET evalost_es_activo = false
            WHERE evalost_cod_pacie = $1;
        `;
        await client.query(updateQuery, [pacienteId]);

        // Insertar la nueva versión activa
        const insertQuery = `
            INSERT INTO dispensario.dmevalost (evalost_cod_pacie)
            VALUES ($1)
            RETURNING *;
        `;
        const { rows } = await client.query(insertQuery, [pacienteId]);

        await client.query('COMMIT');
        return rows[0];
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en transacción de crearNuevaVersion:", error);
        throw error;
    } finally {
        client.release();
    }
};

/**
 * @summary Obtiene una evaluación completa con todos sus detalles.
 * @description Usa json_agg para traer los detalles del examen físico en un solo array.
 * @param {number} evaluacionId El ID de la evaluación a obtener.
 * @returns {Promise<Object>} El objeto de la evaluación completa.
 */
export const obtenerEvaluacionCompleta = async (evaluacionId) => {
    const query = `
        SELECT
            evalost.*,
            COALESCE(det.detalles, '[]'::json) AS detalles
        FROM dispensario.dmevalost AS evalost
        LEFT JOIN (
            SELECT
                det_evalost_cod_evalost,
                json_agg(json_build_object(
                    'det_evalost_cod_det', det_evalost_cod_det,
                    'det_evalost_zona', det_evalost_zona,
                    'det_evalost_asimetria', det_evalost_asimetria,
                    'det_evalost_dolor_escala', det_evalost_dolor_escala,
                    'det_evalost_tipo_dolor', det_evalost_tipo_dolor,
                    'det_evalost_hormigueo', det_evalost_hormigueo,
                    'det_evalost_irradiacion', det_evalost_irradiacion,
                    'det_evalost_frecuencia', det_evalost_frecuencia,
                    'det_evalost_pruebas_funcionales', det_evalost_pruebas_funcionales,
                    'det_evalost_escala_daniels', det_evalost_escala_daniels,
                    'det_evalost_obs_zona', det_evalost_obs_zona
                )) AS detalles
            FROM dispensario.dmdetalle_evalost
            GROUP BY det_evalost_cod_evalost
        ) AS det ON evalost.evalost_cod_evalost = det.det_evalost_cod_evalost
        WHERE evalost.evalost_cod_evalost = $1;
    `;
    const { rows } = await db.query(query, [evaluacionId]);
    return rows[0];
};

/**
 * @summary Actualiza una evaluación osteomuscular existente.
 * @description Utiliza una transacción para actualizar la tabla principal y reinsertar los detalles.
 * @param {number} evaluacionId El ID de la evaluación a actualizar.
 * @param {Object} data El objeto con los datos a actualizar. Contiene datosPrincipales y detalles.
 * @returns {Promise<Object>} La evaluación completa después de la actualización.
 */
export const actualizarEvaluacion = async (evaluacionId, data) => {
    const { datosPrincipales, detalles } = data;
    const client = await db.connect();

    try {
        await client.query('BEGIN');

        const camposPrincipales = Object.keys(datosPrincipales);
        if (camposPrincipales.length > 0) {
            const setClauses = camposPrincipales.map((campo, index) => `${campo} = $${index + 2}`).join(', ');
            const updateQuery = `
                UPDATE dispensario.dmevalost
                SET ${setClauses}
                WHERE evalost_cod_evalost = $1;
            `;
            await client.query(updateQuery, [evaluacionId, ...Object.values(datosPrincipales)]);
        }

        await client.query('DELETE FROM dispensario.dmdetalle_evalost WHERE det_evalost_cod_evalost = $1', [evaluacionId]);

        if (detalles && detalles.length > 0) {
            const insertQuery = `
                INSERT INTO dispensario.dmdetalle_evalost (
                    det_evalost_cod_evalost, det_evalost_zona, det_evalost_asimetria,
                    det_evalost_dolor_escala, det_evalost_tipo_dolor, det_evalost_hormigueo,
                    det_evalost_irradiacion, det_evalost_frecuencia, det_evalost_pruebas_funcionales,
                    det_evalost_escala_daniels, det_evalost_obs_zona
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11);
            `;
            for (const detalle of detalles) {
                const values = [
                    evaluacionId,
                    detalle.det_evalost_zona,
                    detalle.det_evalost_asimetria,
                    detalle.det_evalost_dolor_escala,
                    detalle.det_evalost_tipo_dolor,
                    detalle.det_evalost_hormigueo,
                    detalle.det_evalost_irradiacion,
                    detalle.det_evalost_frecuencia,
                    detalle.det_evalost_pruebas_funcionales,
                    detalle.det_evalost_escala_daniels,
                    detalle.det_evalost_obs_zona,
                ];
                await client.query(insertQuery, values);
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error en transacción de actualizarEvaluacion:", error);
        throw error;
    } finally {
        client.release();
    }

    return await obtenerEvaluacionCompleta(evaluacionId);
};