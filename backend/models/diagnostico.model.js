import { db } from '../database/databasePostgres.js';

// Obtener todos los diagnósticos de una atención
export const getDiagnosticosByAtencionId = async (atencionId) => {
    const query = `
      SELECT 
        d.*, 
        c10.cie10_id_cie10,
        c10.cie10_nom_cie10	
      FROM dispensario.dmdiag d
      LEFT JOIN dispensario.dmcie10 c10 on d.diag_cod_cie10 = c10.cie10_cod_cie10
      WHERE d.diag_cod_aten = $1;
    `;
    const { rows } = await db.query(query, [atencionId]);
    return rows;
  };