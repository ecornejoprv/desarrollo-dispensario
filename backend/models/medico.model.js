import { db } from '../database/databasePostgres.js';

export const getMedicos = async (locationId) => {
  // Se define la parte base de la consulta SQL.
  let query = `
    SELECT 
      m.medic_cod_medic,
      m.medic_nom_medic,
      m.medic_ced_medic,
      e.espe_nom_espe
    FROM dispensario.dmmedic m
    LEFT JOIN dispensario.dmespec e ON m.medic_cod_espe = e.espe_cod_espe
  `;
  
  // Array para almacenar los valores de los parámetros de la consulta de forma segura.
  const values = [];

  // Si se proporciona un ID de ubicación, se modifica la consulta para incluir el JOIN y el filtro.
  if (locationId) {
    // Se une con la tabla intermedia 'medico_disuc' para poder filtrar por sucursal.
    query += `
      JOIN dispensario.medico_disuc md ON m.medic_cod_medic = md.medic_cod_medic
      WHERE m.medic_est_medic = 'AC' AND md.disuc_cod_disuc = $1
    `;
    values.push(locationId);
  } else {
    // Si no hay locationId, solo se filtra por médicos activos.
    query += ` WHERE m.medic_est_medic = 'AC'`;
  }

  // Se añade el ordenamiento al final de la consulta.
  query += ` ORDER BY m.medic_nom_medic;`;
  
  const { rows } = await db.query(query, values);
  return rows;
};