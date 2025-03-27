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

//Registrar un procedimiento
export const registrarProcedimiento = async (procedimientoData) => {
  const query = `
    INSERT INTO dispensario.dmproce (
      proc_cod_diag,
      proc_cod_cie10,
      proc_obs_proc
    ) VALUES ($1, $2, $3)
    RETURNING proc_cod_proc;
  `;

  const { rows } = await db.query(query, [
    procedimientoData.proc_cod_diag,
    procedimientoData.proc_cod_cie10,
    procedimientoData.proc_obs_proc,
  ]);

  return rows[0].proc_cod_proc; // Devuelve el ID del procedimiento registrado
};

// Buscar procedimientos por código o nombre, filtrados por categoría (Medicina General)
export const buscarProcedimientos = async (query) => {
  const searchQuery = `
    SELECT 
      pro10_cod_pro10,
      pro10_ide_pro10,
      pro10_nom_pro10
    FROM dispensario.dmpro10
    WHERE (pro10_ide_pro10 ILIKE $1 OR pro10_nom_pro10 ILIKE $1)
      AND pro10_cod_catpr = 1 -- Filtro para Medicina General
    LIMIT 10;
  `;

  const { rows } = await db.query(searchQuery, [`%${query}%`]);
  return rows;
};