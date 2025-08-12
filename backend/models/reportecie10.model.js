import { db } from '../database/databasePostgres.js';

export const obtenerDiagnosticosPorGenero = async (genero) => {
    let query = `
        SELECT 
            p.pacie_cod_gener,
            g.idgen_nom_idgen AS genero,
            d.diag_cod_cie10,
            c.cie10_nom_cie10 AS nombre_diagnostico,
            COUNT(d.diag_cod_cie10) AS cantidad,
            STRING_AGG(d.diag_obs_diag, '; ') AS observaciones
        FROM 
            dispensario.dmdiag d
        JOIN 
            dispensario.dmatenc a ON d.diag_cod_aten = a.aten_cod_aten
        JOIN 
            dispensario.dmpacie p ON a.aten_cod_paci = p.pacie_cod_pacie
        JOIN 
            dispensario.dmidgen g ON p.pacie_cod_gener = g.idgen_cod_idgen
        JOIN 
            dispensario.dmcie10 c ON d.diag_cod_cie10 = c.cie10_cod_cie10
    `;

    const valores = [];

    if (genero) {
        query += ` WHERE p.pacie_cod_gener = $1`;
        valores.push(genero);
    }

    query += `
        GROUP BY 
            p.pacie_cod_gener, g.idgen_nom_idgen, d.diag_cod_cie10, c.cie10_nom_cie10
        ORDER BY 
            g.idgen_nom_idgen, cantidad DESC
    `;

    const { rows } = await db.query(query, valores);
    return rows;
};


export const obtenerFiltrosReporte = async () => {
    return {
        generos: await db.query('SELECT idgen_cod_idgen, idgen_nom_idgen FROM dispensario.dmidgen ORDER BY idgen_nom_idgen')
    };
};
export const obtenerTodosLosGeneros = async () => {
  try {
    const query = `
      SELECT idgen_cod_idgen, idgen_nom_idgen 
      FROM dispensario.dmidgen 
      ORDER BY idgen_nom_idgen
    `;
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error en modelo al obtener géneros:', error);
    throw error; // Relanzamos el error para manejarlo en el controlador
  }
};