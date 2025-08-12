// models/receta.model.js (Código Completo y Actualizado)
// ==============================================================================
// @summary: Se actualiza la consulta 'getDatosReceta' para incluir el campo
//           'aten_cod_disu', que identifica el lugar de la atención.
//           Este dato es crucial para que el frontend pueda renderizar la
//           cabecera de la receta de forma dinámica.
// ==============================================================================

import { db } from '../database/databasePostgres.js';

export const getDatosReceta = async (atencionId) => {
    const query = `
        SELECT
            a.aten_num_receta,
            a.aten_cod_disu, -- <-- SE AÑADE ESTA LÍNEA
            p.pacie_nom_pacie, p.pacie_ape_pacie, p.pacie_ced_pacie, p.pacie_fec_nac,
            m.medic_nom_medic as medico_nombre,
            json_agg(DISTINCT diag.*) FILTER (WHERE diag.diag_cod_diag IS NOT NULL) as diagnosticos,
            json_agg(DISTINCT pres.*) FILTER (WHERE pres.pres_cod_pres IS NOT NULL) as prescripciones,
            json_agg(DISTINCT ig.*) FILTER (WHERE ig.indi_cod_indi IS NOT NULL) as indicaciones_generales,
            json_agg(DISTINCT sa.*) FILTER (WHERE sa.signa_cod_signa IS NOT NULL) as signos_alarma,
            (SELECT json_agg(al.*) FROM dispensario.dmaler al WHERE al.aler_cod_pacie = a.aten_cod_paci AND al.aler_est_aler = 'activa') as alergias
        FROM dispensario.dmatenc a
        JOIN dispensario.dmpacie p ON a.aten_cod_paci = p.pacie_cod_pacie
        JOIN dispensario.dmmedic m ON a.aten_cod_medi = m.medic_cod_medic
        LEFT JOIN (
            SELECT 
                d.diag_cod_aten, d.diag_cod_diag, c.cie10_id_cie10, c.cie10_nom_cie10
            FROM dispensario.dmdiag d
            JOIN dispensario.dmcie10 c ON d.diag_cod_cie10 = c.cie10_cod_cie10
        ) diag ON diag.diag_cod_aten = a.aten_cod_aten
        LEFT JOIN dispensario.dmpresc pres ON pres.pres_cod_aten = a.aten_cod_aten
        LEFT JOIN dispensario.dmindic ig ON ig.indi_cod_aten = a.aten_cod_aten
        LEFT JOIN dispensario.dmsigna sa ON sa.signa_cod_aten = a.aten_cod_aten
        WHERE a.aten_cod_aten = $1
        GROUP BY 
            a.aten_cod_aten, -- <-- Se agrupa por el ID de atención para que la consulta sea válida
            p.pacie_nom_pacie, p.pacie_ape_pacie, p.pacie_ced_pacie, p.pacie_fec_nac, 
            m.medic_nom_medic;
    `;
    const { rows } = await db.query(query, [atencionId]);
    if (rows.length === 0) {
        throw new Error("No se encontraron datos de la atención para la receta.");
    }
    return rows[0];
};