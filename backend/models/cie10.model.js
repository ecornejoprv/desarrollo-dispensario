import { db } from '../database/databasePostgres.js';

// Buscar códigos CIE10 por identificador o nombre
export const buscarCie10 = async (query, limit = 50, lastId = null) => {
  let searchQuery = `
    SELECT 
      cie10_cod_cie10,
      cie10_id_cie10,
      cie10_nom_cie10
    FROM dispensario.dmcie10
    WHERE (cie10_id_cie10 ILIKE $1 OR cie10_nom_cie10 ILIKE $1)
  `;
  
  const params = [`%${query}%`];
  
  if (lastId) {
    searchQuery += ` AND cie10_cod_cie10 > $2`;
    params.push(lastId);
  }
  
  searchQuery += ` ORDER BY cie10_cod_cie10 LIMIT $${params.length + 1}`;
  params.push(limit);
  
  const { rows } = await db.query(searchQuery, params);
  return rows;
};