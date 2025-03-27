import { db } from '../database/databasePostgres.js';

// Registrar terapias para un diagnóstico
export const registrarTerapias = async (terapiasData) => {
  const { diag_cod_diag, nombre, tecnicas } = terapiasData;
  
  const query = `
    INSERT INTO dispensario.dmterap (
      terap_cod_diag,
      terap_nom_terap,
      terap_tec_terap
    ) VALUES ($1, $2, $3)
    RETURNING terap_cod_terap;
  `;

  // Convertir array de técnicas a string separado por comas
  const tecnicasStr = tecnicas.join(',');
  
  const { rows } = await db.query(query, [diag_cod_diag, nombre, tecnicasStr]);
  return rows[0].terap_cod_terap;
};

// Obtener terapias por diagnóstico
export const getTerapiasByDiagnosticoId = async (diagnosticoId) => {
  const query = `
    SELECT * FROM dispensario.dmterap
    WHERE terap_cod_diag = $1;
  `;
  
  const { rows } = await db.query(query, [diagnosticoId]);
  
  // Convertir string de técnicas a array
  return rows.map(row => ({
    ...row,
    terap_tec_terap: row.terap_tec_terap ? row.terap_tec_terap.split(',') : []
  }));
};