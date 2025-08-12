// ===================================================================================
// == Archivo Completo y Definitivo: backend/models/odontograma.model.js ==
// ===================================================================================
// @summary Versión final con la consulta de 'obtenerOdontogramaCompleto'
//          corregida para asegurar que todos los datos (incluyendo IHO-S)
//          se carguen correctamente.

import { db } from '../database/databasePostgres.js';
import { v4 as uuidv4 } from 'uuid';

export const listarOdontogramasPorPaciente = async (pacienteId) => {
    const listQuery = `
        SELECT odont_cod_odont, odont_fec_odont, odont_es_activo 
        FROM dispensario.dmodont
        WHERE odont_cod_pacie = $1
        ORDER BY odont_fec_odont DESC, odont_cod_odont DESC;
    `;
    const { rows } = await db.query(listQuery, [pacienteId]);
    if (rows.length === 0) {
        const nuevoOdontograma = await crearNuevoOdontograma(pacienteId);
        return [{
            odont_cod_odont: nuevoOdontograma.odont_cod_odont,
            odont_fec_odont: nuevoOdontograma.odont_fec_odont,
            odont_es_activo: nuevoOdontograma.odont_es_activo,
        }];
    }
    return rows;
};

export const crearNuevoOdontograma = async (pacienteId) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const updateQuery = `UPDATE dispensario.dmodont SET odont_es_activo = false WHERE odont_cod_pacie = $1;`;
        await client.query(updateQuery, [pacienteId]);
        const insertQuery = `INSERT INTO dispensario.dmodont (odont_cod_pacie) VALUES ($1) RETURNING *;`;
        const { rows } = await client.query(insertQuery, [pacienteId]);
        await client.query('COMMIT');
        return rows[0];
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const actualizarOdontograma = async (odontogramaId, updateData) => {
  const fields = Object.keys(updateData);
  if (fields.length === 0) {
    const { rows } = await db.query('SELECT * FROM dispensario.dmodont WHERE odont_cod_odont = $1', [odontogramaId]);
    return rows[0];
  }
  const setClauses = fields.map((field, index) => `"${field}" = $${index + 1}`).join(', ');
  const values = Object.values(updateData);
  const query = `
    UPDATE dispensario.dmodont
    SET ${setClauses}, odont_fec_odont = CURRENT_DATE
    WHERE odont_cod_odont = $${fields.length + 1}
    RETURNING *;
  `;
  const { rows } = await db.query(query, [...values, odontogramaId]);
  return rows[0];
};

export const obtenerOdontogramaCompleto = async (odontogramaId) => {
  // ✅ MEJORA: La consulta ahora incluye los nuevos campos de CPO-ceo.
  const query = `
      SELECT
          o.odont_cod_odont,
          o.odont_fec_odont,
          o.odont_obs_odont,
          o.odont_es_activo,
          o.odont_periodonto,
          o.odont_maloclusion,
          o.odont_fluorosis,
          o.odont_cpo_c,
          o.odont_cpo_p,
          o.odont_cpo_o,
          o.odont_ceo_c,
          o.odont_ceo_e,
          o.odont_ceo_o,
          COALESCE(det.detalles, '[]'::json) as detalles,
          COALESCE(perio."datosPeriodontales", '[]'::json) as "datosPeriodontales",
          COALESCE(ihos."ihosDetalles", '[]'::json) as "ihosDetalles"
      FROM dispensario.dmodont o
      
      LEFT JOIN (
          SELECT
              d.dodon_cod_odont,
              json_agg(jsonb_build_object(
                  'id', d.dodon_cod_dodon, 'dienteId', di.diente_id_diente, 'dienteNombre', di.diente_nom_diente,
                  'superficie', s.suden_nom_suden, 'estado', e.esden_nom_esden, 'colorEstado', e.esden_col_esden,
                  'observaciones', d.dodon_obs_dodon, 'grupoId', d.dodon_grupo_id
              )) as detalles
          FROM dispensario.dmdodon d
          LEFT JOIN dispensario.dmdiente di ON d.dodon_cod_diente = di.diente_cod_diente
          LEFT JOIN dispensario.dmsuden s ON d.dodon_cod_suden = s.suden_cod_suden
          LEFT JOIN dispensario.dmesden e ON d.dodon_cod_esden = e.esden_cod_esden
          WHERE d.dodon_cod_odont = $1
          GROUP BY d.dodon_cod_odont
      ) as det ON o.odont_cod_odont = det.dodon_cod_odont

      LEFT JOIN (
          SELECT
              p.perio_cod_odont,
              json_agg(jsonb_build_object(
                  'dienteId', di.diente_id_diente, 'movilidad', p.perio_movilidad, 'recesion', p.perio_recesion
              )) as "datosPeriodontales"
          FROM dispensario.dmperio p
          JOIN dispensario.dmdiente di ON p.perio_cod_diente = di.diente_cod_diente
          WHERE p.perio_cod_odont = $1
          GROUP BY p.perio_cod_odont
      ) as perio ON o.odont_cod_odont = perio.perio_cod_odont

      LEFT JOIN (
          SELECT
              ih.ihos_cod_odont,
              json_agg(jsonb_build_object(
                  'ihosId', ih.ihos_cod_ihos, 'dienteCodigo', ih.ihos_cod_diente,
                  'placa', ih.ihos_placa, 'calculo', ih.ihos_calculo, 'gingivitis', ih.ihos_gingivitis
              )) as "ihosDetalles"
          FROM dispensario.dmihos ih
          WHERE ih.ihos_cod_odont = $1
          GROUP BY ih.ihos_cod_odont
      ) as ihos ON o.odont_cod_odont = ihos.ihos_cod_odont

      WHERE o.odont_cod_odont = $1;
  `;
  const { rows } = await db.query(query, [odontogramaId]);
  return rows[0];
};

export const upsertDetalleDental = async (odontogramaId, detalleData) => {
    const query = `
        INSERT INTO dispensario.dmdodon (
            dodon_cod_odont, dodon_cod_diente, dodon_cod_suden,
            dodon_cod_esden, dodon_obs_dodon, dodon_grupo_id
        ) VALUES ($1, $2, $3, $4, $5, NULL)
        ON CONFLICT (dodon_cod_odont, dodon_cod_diente, dodon_cod_suden)
        DO UPDATE SET
            dodon_cod_esden = EXCLUDED.dodon_cod_esden,
            dodon_obs_dodon = EXCLUDED.dodon_obs_dodon,
            dodon_grupo_id = NULL
        RETURNING *;
    `;
    const values = [
        odontogramaId, detalleData.dienteId,
        detalleData.superficieId || null, detalleData.estadoId,
        detalleData.observaciones || null
    ];
    const { rows } = await db.query(query, values);
    return rows[0];
};

export const setEstadoDienteCompleto = async (odontogramaId, dienteId, estadoData) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM dispensario.dmdodon WHERE dodon_cod_odont = $1 AND dodon_cod_diente = $2;`, [odontogramaId, dienteId]);
        const upsertQuery = `
            INSERT INTO dispensario.dmdodon (dodon_cod_odont, dodon_cod_diente, dodon_cod_suden, dodon_cod_esden, dodon_grupo_id)
            VALUES ($1, $2, NULL, $3, NULL)
            RETURNING *;
        `;
        const { rows } = await client.query(upsertQuery, [odontogramaId, dienteId, estadoData.estadoId]);
        await client.query('COMMIT');
        return rows[0];
    } catch (e) {
        await client.query('ROLLBACK'); throw e;
    } finally {
        client.release();
    }
};

export const upsertIhosDetalle = async ({ odontogramaId, detallesIhos }) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        await client.query('DELETE FROM dispensario.dmihos WHERE ihos_cod_odont = $1', [odontogramaId]);
        if (!detallesIhos || detallesIhos.length === 0) {
            await client.query('COMMIT');
            return [];
        }
        const insertPromises = detallesIhos.map(detalle => {
            const query = `
                INSERT INTO dispensario.dmihos (ihos_cod_odont, ihos_cod_diente, ihos_placa, ihos_calculo, ihos_gingivitis)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING 
                    ihos_cod_ihos AS "ihosId", ihos_cod_diente AS "dienteCodigo",
                    ihos_placa AS placa, ihos_calculo AS calculo, ihos_gingivitis AS gingivitis;
            `;
            const values = [ odontogramaId, detalle.dienteCodigo, detalle.placa, detalle.calculo, detalle.gingivitis ];
            return client.query(query, values);
        });
        const results = await Promise.all(insertPromises);
        await client.query('COMMIT');
        return results.map(res => res.rows[0]);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const upsertPerioData = async ({ odontogramaId, dienteId, recesion, movilidad }) => {
    const query = `
        INSERT INTO dispensario.dmperio (perio_cod_odont, perio_cod_diente, perio_recesion, perio_movilidad)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (perio_cod_odont, perio_cod_diente)
        DO UPDATE SET
            perio_recesion = EXCLUDED.perio_recesion,
            perio_movilidad = EXCLUDED.perio_movilidad
        RETURNING *;
    `;
    const values = [odontogramaId, dienteId, recesion || null, movilidad || null];
    const { rows } = await db.query(query, values);
    return rows[0];
};

export const eliminarDetalleDental = async (detalleId) => {
    const query = `DELETE FROM dispensario.dmdodon WHERE dodon_cod_dodon = $1 RETURNING *;`;
    const { rows } = await db.query(query, [detalleId]);
    return rows[0];
};

export const aplicarEstadoEnRango = async ({ odontogramaId, dienteInicioId, dienteFinId, estadoId }) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const grupoId = uuidv4();
        const getDienteInfoQuery = `SELECT diente_tip_diente FROM dispensario.dmdiente WHERE diente_id_diente = $1;`;
        const inicioResult = await client.query(getDienteInfoQuery, [dienteInicioId]);
        const finResult = await client.query(getDienteInfoQuery, [dienteFinId]);
        if (inicioResult.rows.length === 0 || finResult.rows.length === 0) throw new Error("El diente de inicio o fin especificado no existe.");
        if (inicioResult.rows[0].diente_tip_diente !== finResult.rows[0].diente_tip_diente) throw new Error("No se puede aplicar una prótesis entre dientes permanentes y temporales.");
        const tipoDiente = inicioResult.rows[0].diente_tip_diente;
        const inicio = Math.min(parseInt(dienteInicioId, 10), parseInt(dienteFinId, 10));
        const fin = Math.max(parseInt(dienteInicioId, 10), parseInt(dienteFinId, 10));
        const getDientesInRangeQuery = `SELECT diente_cod_diente FROM dispensario.dmdiente WHERE CAST(diente_id_diente AS INTEGER) >= $1 AND CAST(diente_id_diente AS INTEGER) <= $2 AND diente_tip_diente = $3;`;
        const dientesResult = await client.query(getDientesInRangeQuery, [inicio, fin, tipoDiente]);
        if (dientesResult.rows.length === 0) throw new Error("No se encontraron dientes válidos en el rango especificado.");
        const dienteCodes = dientesResult.rows.map(row => row.diente_cod_diente);
        await client.query(`DELETE FROM dispensario.dmdodon WHERE dodon_cod_odont = $1 AND dodon_cod_diente = ANY($2::int[]);`, [odontogramaId, dienteCodes]);
        const insertPromises = dienteCodes.map(dienteCod => {
            const insertQuery = `INSERT INTO dispensario.dmdodon (dodon_cod_odont, dodon_cod_diente, dodon_cod_esden, dodon_grupo_id) VALUES ($1, $2, $3, $4) RETURNING *;`;
            return client.query(insertQuery, [odontogramaId, dienteCod, estadoId, grupoId]);
        });
        const results = await Promise.all(insertPromises);
        await client.query('COMMIT');
        return results.map(res => res.rows[0]);
    } catch (e) {
        await client.query('ROLLBACK'); throw e;
    } finally {
        client.release();
    }
};

export const aplicarProtesisTotalArcada = async ({ odontogramaId, dienteId, estadoId }) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const dienteInfoQuery = `SELECT diente_cua_diente, diente_tip_diente FROM dispensario.dmdiente WHERE diente_cod_diente = $1;`;
        const dienteInfoResult = await client.query(dienteInfoQuery, [dienteId]);
        if (dienteInfoResult.rows.length === 0) throw new Error("El diente seleccionado no existe.");
        const { diente_cua_diente, diente_tip_diente } = dienteInfoResult.rows[0];
        const esArcadaSuperior = [1, 2].includes(diente_cua_diente);
        const cuadrantes = esArcadaSuperior ? [1, 2] : [3, 4];
        const getDientesArcadaQuery = `SELECT diente_cod_diente FROM dispensario.dmdiente WHERE diente_cua_diente = ANY($1::int[]) AND diente_tip_diente = $2;`;
        const dientesArcadaResult = await client.query(getDientesArcadaQuery, [cuadrantes, diente_tip_diente]);
        const dienteCodes = dientesArcadaResult.rows.map(row => row.diente_cod_diente);
        if (dienteCodes.length === 0) throw new Error("No se encontraron dientes en la arcada y tipo de dentición especificada.");
        await client.query(`DELETE FROM dispensario.dmdodon WHERE dodon_cod_odont = $1 AND dodon_cod_diente = ANY($2::int[]);`, [odontogramaId, dienteCodes]);
        const insertPromises = dienteCodes.map(dienteCod => {
            const insertQuery = `INSERT INTO dispensario.dmdodon (dodon_cod_odont, dodon_cod_diente, dodon_cod_esden) VALUES ($1, $2, $3) RETURNING *;`;
            return client.query(insertQuery, [odontogramaId, dienteCod, estadoId]);
        });
        const results = await Promise.all(insertPromises);
        await client.query('COMMIT');
        return results.map(res => res.rows[0]);
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const eliminarProtesisCompleta = async ({ odontogramaId, dienteId }) => {
    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const clickedToothInfoQuery = `SELECT e.esden_nom_esden as estado, d.dodon_grupo_id FROM dispensario.dmdodon d JOIN dispensario.dmesden e ON d.dodon_cod_esden = e.esden_cod_esden WHERE d.dodon_cod_odont = $1 AND d.dodon_cod_diente = $2 AND d.dodon_cod_suden IS NULL;`;
        const clickedToothResult = await client.query(clickedToothInfoQuery, [odontogramaId, dienteId]);
        if (clickedToothResult.rows.length === 0) {
            await client.query('COMMIT');
            return { deletedIds: [] };
        }
        const { dodon_grupo_id } = clickedToothResult.rows[0];
        let deletedRows;
        if (dodon_grupo_id) {
            const deleteQuery = `DELETE FROM dispensario.dmdodon WHERE dodon_cod_odont = $1 AND dodon_grupo_id = $2 RETURNING dodon_cod_dodon;`;
            const result = await client.query(deleteQuery, [odontogramaId, dodon_grupo_id]);
            deletedRows = result.rows;
        } else {
            const deleteQuery = `DELETE FROM dispensario.dmdodon WHERE dodon_cod_odont = $1 AND dodon_cod_diente = $2 RETURNING dodon_cod_dodon;`;
            const result = await client.query(deleteQuery, [odontogramaId, dienteId]);
            deletedRows = result.rows;
        }
        await client.query('COMMIT');
        return { deletedIds: deletedRows.map(r => r.dodon_cod_dodon) };
    } catch (e) {
        await client.query('ROLLBACK');
        throw e;
    } finally {
        client.release();
    }
};

export const obtenerDientes = async () => {
    const query = 'SELECT diente_cod_diente, diente_id_diente, diente_nom_diente, diente_tip_diente, diente_cua_diente FROM dispensario.dmdiente ORDER BY diente_id_diente;';
    const { rows } = await db.query(query);
    return rows;
};

export const obtenerEstadosDentales = async () => {
    const query = 'SELECT esden_cod_esden, esden_nom_esden, esden_des_esden, esden_col_esden FROM dispensario.dmesden ORDER BY esden_nom_esden;';
    const { rows } = await db.query(query);
    return rows;
};

export const obtenerSuperficiesDentales = async () => {
    const query = 'SELECT suden_cod_suden, suden_nom_suden FROM dispensario.dmsuden ORDER BY suden_nom_suden;';
    const { rows } = await db.query(query);
    return rows;
};