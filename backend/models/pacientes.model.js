import { db } from '../database/databasePostgres.js'; // Importa db correctamente

// Obtener todos los pacientes
export const getAllPacientes = async () => {
  const { rows } = await db.query("SELECT * FROM dispensario.dmpacie"); // Usa db en lugar de pool
  return rows;
};

// Obtener un paciente por ID
export const getPacienteById = async (id) => {
  const { rows } = await db.query("SELECT * FROM dispensario.dmpacie WHERE pacie_cod_pacie = $1", [id]); // Usa db en lugar de pool
  return rows[0];
};

// Crear un nuevo paciente
export const createPaciente = async (paciente) => {
  const {
    pacie_nom_pacie, pacie_ape_pacie, pacie_fec_nac, pacie_cod_sexo, pacie_cod_etnia,
    pacie_cod_relig, pacie_cod_inst, pacie_cod_osex, pacie_cod_idgen, pacie_cod_tisa,
    pacie_cod_estc, pacie_cod_tise, pacie_dir_pacie, pacie_tel_pacie, pacie_cor_pacie,
    pacie_fec_ingr, pacie_est_pacie
  } = paciente;

  const { rows } = await db.query( // Usa db en lugar de pool
    `INSERT INTO dispensario.dmpacie (
      pacie_nom_pacie, pacie_ape_pacie, pacie_fec_nac, pacie_cod_sexo, pacie_cod_etnia,
      pacie_cod_relig, pacie_cod_inst, pacie_cod_osex, pacie_cod_idgen, pacie_cod_tisa,
      pacie_cod_estc, pacie_cod_tise, pacie_dir_pacie, pacie_tel_pacie, pacie_cor_pacie,
      pacie_fec_ingr, pacie_est_pacie
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17) RETURNING *`,
    [
      pacie_nom_pacie, pacie_ape_pacie, pacie_fec_nac, pacie_cod_sexo, pacie_cod_etnia,
      pacie_cod_relig, pacie_cod_inst, pacie_cod_osex, pacie_cod_idgen, pacie_cod_tisa,
      pacie_cod_estc, pacie_cod_tise, pacie_dir_pacie, pacie_tel_pacie, pacie_cor_pacie,
      pacie_fec_ingr, pacie_est_pacie
    ]
  );
  return rows[0];
};

// Actualizar un paciente
export const updatePaciente = async (id, paciente) => {
  const {
    pacie_nom_pacie, pacie_ape_pacie, pacie_fec_nac, pacie_cod_sexo, pacie_cod_etnia,
    pacie_cod_relig, pacie_cod_inst, pacie_cod_osex, pacie_cod_idgen, pacie_cod_tisa,
    pacie_cod_estc, pacie_cod_tise, pacie_dir_pacie, pacie_tel_pacie, pacie_cor_pacie,
    pacie_fec_ingr, pacie_est_pacie
  } = paciente;

  const { rows } = await db.query( // Usa db en lugar de pool
    `UPDATE dispensario.dmpacie SET
      pacie_nom_pacie = $1, pacie_ape_pacie = $2, pacie_fec_nac = $3, pacie_cod_sexo = $4,
      pacie_cod_etnia = $5, pacie_cod_relig = $6, pacie_cod_inst = $7, pacie_cod_osex = $8,
      pacie_cod_idgen = $9, pacie_cod_tisa = $10, pacie_cod_estc = $11, pacie_cod_tise = $12,
      pacie_dir_pacie = $13, pacie_tel_pacie = $14, pacie_cor_pacie = $15, pacie_fec_ingr = $16,
      pacie_est_pacie = $17
    WHERE pacie_cod_pacie = $18 RETURNING *`,
    [
      pacie_nom_pacie, pacie_ape_pacie, pacie_fec_nac, pacie_cod_sexo, pacie_cod_etnia,
      pacie_cod_relig, pacie_cod_inst, pacie_cod_osex, pacie_cod_idgen, pacie_cod_tisa,
      pacie_cod_estc, pacie_cod_tise, pacie_dir_pacie, pacie_tel_pacie, pacie_cor_pacie,
      pacie_fec_ingr, pacie_est_pacie, id
    ]
  );
  return rows[0];
};

// Eliminar un paciente (cambiar estado a 'I')
export const deletePaciente = async (id) => {
  const { rows } = await db.query( // Usa db en lugar de pool
    "UPDATE dispensario.dmpacie SET pacie_est_pacie = $1 WHERE pacie_cod_pacie = $2 RETURNING *",
    ['I', id]
  );
  return rows[0];
};