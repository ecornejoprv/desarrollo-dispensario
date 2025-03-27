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

  // Registrar un diagnóstico
  export const registrarDiagnostico = async (diagnosticoData) => {
    const query = `
      INSERT INTO dispensario.dmdiag (
        diag_cod_aten,
        diag_cod_cie10,
        diag_obs_diag,
        diag_est_diag
      ) VALUES ($1, $2, $3, $4)
      RETURNING diag_cod_diag;
    `;
  
    const { rows } = await db.query(query, [
      diagnosticoData.diag_cod_aten,
      diagnosticoData.diag_cod_cie10,
      diagnosticoData.diag_obs_diag,
      diagnosticoData.diag_est_diag,
    ]);
  
    return rows[0].diag_cod_diag; // Devuelve el ID del diagnóstico registrado
  };