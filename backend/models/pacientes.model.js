import { db } from '../database/databasePostgres.js'; // Importa db correctamente

// Obtener todos los pacientes
export const getAllPacientes = async (search = "", page = 1, limit = 10) => {
    const offset = (page - 1) * limit; // Calcular el offset para la paginación
  
    // Consulta con búsqueda por apellidos y cédula, y paginación
    const { rows } = await db.query(
      `SELECT * FROM dispensario.dmpacie 
       WHERE pacie_ape_pacie ILIKE $1 OR pacie_ced_pacie ILIKE $1
       ORDER BY pacie_cod_pacie
       LIMIT $2 OFFSET $3`,
      [`%${search}%`, limit, offset]
    );
  
    // Obtener el total de pacientes para la paginación
    const { rows: countRows } = await db.query(
      `SELECT COUNT(*) as total FROM dispensario.dmpacie 
       WHERE pacie_ape_pacie ILIKE $1 OR pacie_ced_pacie ILIKE $1`,
      [`%${search}%`]
    );
  
    return {
      pacientes: rows,
      total: parseInt(countRows[0].total), // Total de pacientes que coinciden con la búsqueda
    };
  };

// Obtener un paciente por ID
export const getPacienteById = async (id) => {
  const { rows } = await db.query("SELECT * FROM dispensario.dmpacie WHERE pacie_cod_pacie = $1", [id]); // Usa db en lugar de pool
  return rows[0];
};

// Crear un nuevo paciente
// Crear un nuevo paciente
export const createPaciente = async (paciente) => {
    const {
      pacie_ced_pacie,
      pacie_cod_empr,
      pacie_tip_pacie,
      pacie_emp_famil,
      pacie_nom_pacie,
      pacie_ape_pacie,
      pacie_dir_pacie,
      pacie_parr_pacie,
      pacie_barr_pacie,
      pacie_tel_pacie,
      pacie_zon_pacie,
      pacie_cod_sexo,
      pacie_cod_estc,
      pacie_cod_relig,
      pacie_cod_pais,
      pacie_fec_nac,
      pacie_parr_nacim,
      pacie_emai_pacie,
      pacie_cod_inst,
      pacie_cod_disc,
      pacie_por_disc,
      pacie_nom_cont,
      pacie_dir_cont,
      pacie_tel_con,
      pacie_cod_etnia,
      pacie_enf_catas,
      pacie_cod_sangr,
      pacie_cod_osex,
      pacie_cod_gener,
      pacie_late_pacie,
      pacie_est_pacie,
    } = paciente;
  
    const { rows } = await db.query(
      `INSERT INTO dispensario.dmpacie (
        pacie_ced_pacie, pacie_cod_empr, pacie_tip_pacie, pacie_emp_famil, pacie_nom_pacie,
        pacie_ape_pacie, pacie_dir_pacie, pacie_parr_pacie, pacie_barr_pacie, pacie_tel_pacie,
        pacie_zon_pacie, pacie_cod_sexo, pacie_cod_estc, pacie_cod_relig, pacie_cod_pais,
        pacie_fec_nac, pacie_parr_nacim, pacie_emai_pacie, pacie_cod_inst, pacie_cod_disc,
        pacie_por_disc, pacie_nom_cont, pacie_dir_cont, pacie_tel_con, pacie_cod_etnia,
        pacie_enf_catas, pacie_cod_sangr, pacie_cod_osex, pacie_cod_gener, pacie_late_pacie,
        pacie_est_pacie
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31) RETURNING *`,
      [
        pacie_ced_pacie,
        pacie_cod_empr,
        pacie_tip_pacie,
        pacie_emp_famil,
        pacie_nom_pacie,
        pacie_ape_pacie,
        pacie_dir_pacie,
        pacie_parr_pacie,
        pacie_barr_pacie,
        pacie_tel_pacie,
        pacie_zon_pacie,
        pacie_cod_sexo,
        pacie_cod_estc,
        pacie_cod_relig,
        pacie_cod_pais,
        pacie_fec_nac,
        pacie_parr_nacim,
        pacie_emai_pacie,
        pacie_cod_inst,
        pacie_cod_disc,
        pacie_por_disc,
        pacie_nom_cont,
        pacie_dir_cont,
        pacie_tel_con,
        pacie_cod_etnia,
        pacie_enf_catas,
        pacie_cod_sangr,
        pacie_cod_osex,
        pacie_cod_gener,
        pacie_late_pacie,
        pacie_est_pacie,
      ]
    );
    return rows[0];
  };

// Actualizar un paciente
export const updatePaciente = async (id, paciente) => {
    const {
      pacie_ced_pacie,
      pacie_cod_empr,
      pacie_tip_pacie,
      pacie_emp_famil,
      pacie_nom_pacie,
      pacie_ape_pacie,
      pacie_dir_pacie,
      pacie_parr_pacie,
      pacie_barr_pacie,
      pacie_tel_pacie,
      pacie_zon_pacie,
      pacie_cod_sexo,
      pacie_cod_estc,
      pacie_cod_relig,
      pacie_cod_pais,
      pacie_fec_nac,
      pacie_parr_nacim,
      pacie_emai_pacie,
      pacie_cod_inst,
      pacie_cod_disc,
      pacie_por_disc,
      pacie_nom_cont,
      pacie_dir_cont,
      pacie_tel_con,
      pacie_cod_etnia,
      pacie_enf_catas,
      pacie_cod_sangr,
      pacie_cod_osex,
      pacie_cod_gener,
      pacie_late_pacie,
      pacie_est_pacie,
    } = paciente;
  
    const { rows } = await db.query(
      `UPDATE dispensario.dmpacie SET
        pacie_ced_pacie = $1,
        pacie_cod_empr = $2,
        pacie_tip_pacie = $3,
        pacie_emp_famil = $4,
        pacie_nom_pacie = $5,
        pacie_ape_pacie = $6,
        pacie_dir_pacie = $7,
        pacie_parr_pacie = $8,
        pacie_barr_pacie = $9,
        pacie_tel_pacie = $10,
        pacie_zon_pacie = $11,
        pacie_cod_sexo = $12,
        pacie_cod_estc = $13,
        pacie_cod_relig = $14,
        pacie_cod_pais = $15,
        pacie_fec_nac = $16,
        pacie_parr_nacim = $17,
        pacie_emai_pacie = $18,
        pacie_cod_inst = $19,
        pacie_cod_disc = $20,
        pacie_por_disc = $21,
        pacie_nom_cont = $22,
        pacie_dir_cont = $23,
        pacie_tel_con = $24,
        pacie_cod_etnia = $25,
        pacie_enf_catas = $26,
        pacie_cod_sangr = $27,
        pacie_cod_osex = $28,
        pacie_cod_gener = $29,
        pacie_late_pacie = $30,
        pacie_est_pacie = $31
      WHERE pacie_cod_pacie = $32 RETURNING *`,
      [
        pacie_ced_pacie,
        pacie_cod_empr,
        pacie_tip_pacie,
        pacie_emp_famil,
        pacie_nom_pacie,
        pacie_ape_pacie,
        pacie_dir_pacie,
        pacie_parr_pacie,
        pacie_barr_pacie,
        pacie_tel_pacie,
        pacie_zon_pacie,
        pacie_cod_sexo,
        pacie_cod_estc,
        pacie_cod_relig,
        pacie_cod_pais,
        pacie_fec_nac,
        pacie_parr_nacim,
        pacie_emai_pacie,
        pacie_cod_inst,
        pacie_cod_disc,
        pacie_por_disc,
        pacie_nom_cont,
        pacie_dir_cont,
        pacie_tel_con,
        pacie_cod_etnia,
        pacie_enf_catas,
        pacie_cod_sangr,
        pacie_cod_osex,
        pacie_cod_gener,
        pacie_late_pacie,
        pacie_est_pacie,
        id,
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