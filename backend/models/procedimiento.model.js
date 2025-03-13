import { db } from '../database/databasePostgres.js';

// Obtener todos los procedimientos de un diagnóstico con detalles de dmpro10
export const getProcedimientosByDiagnosticoId = async (diagnosticoId) => {
  const query = `
    SELECT 
      p.*, 
      p10.pro10_ide_pro10, 
      p10.pro10_nom_pro10
    FROM dispensario.dmproce p
    LEFT JOIN dispensario.dmpro10 p10 ON p.proc_cod_cie10 = p10.pro10_cod_pro10
    WHERE p.proc_cod_diag = $1;
  `;
  const { rows } = await db.query(query, [diagnosticoId]);
  return rows;
};