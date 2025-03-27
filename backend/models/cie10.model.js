import { db } from '../database/databasePostgres.js';

// Buscar códigos CIE10 por identificador o nombre
export const buscarCie10 = async (query) => {
  const searchQuery = `
    SELECT 
      cie10_cod_cie10,
      cie10_id_cie10,
      cie10_nom_cie10
    FROM dispensario.dmcie10
    WHERE cie10_id_cie10 ILIKE $1 OR cie10_nom_cie10 ILIKE $1
    LIMIT 10;
  `;

  const { rows } = await db.query(searchQuery, [`%${query}%`]);
  return rows;
};