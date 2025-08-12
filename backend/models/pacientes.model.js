import { db } from "../database/databasePostgres.js";

// Obtener todos los pacientes
export const getAllPacientes = async (
  search = "",
  page = 1,
  limit = 10,
  userCompanies = []
) => {
  // Calcula el offset para la paginación de la base de datos.
  const offset = (page - 1) * limit;

  // Log de depuración para verificar las empresas del usuario que llegan al modelo.
  //console.log(
  //  "DEBUG MODEL (getAllPacientes): userCompanies recibido:",
  //  userCompanies
  //);

  // --- CONSTRUCCIÓN DE LA CONSULTA BASE ---
  let queryText = `SELECT p.*, e.empr_nom_empr, s.sexo_nom_sexo
FROM dispensario.dmpacie p
JOIN dispensario.dmempr e ON p.pacie_cod_empr = e.empr_cod_empr
LEFT JOIN dispensario.dmsexo s ON p.pacie_cod_sexo = s.sexo_cod_sexo
WHERE 1 = 1`;

  // Consulta para contar el total de registros que coinciden con los filtros.
  let countQueryText = `SELECT COUNT(*) as total
FROM dispensario.dmpacie p
WHERE 1 = 1`;

  // Array para almacenar los parámetros de la consulta.
  const queryParams = [];
  // Índice para los placeholders ($1, $2, ...).
  let paramIndex = 1;

  // --- LÓGICA DE BÚSQUEDA PREDICTIVA ("EMPIEZA CON") ---
  // Se aplica el filtro de búsqueda solo si el usuario ha escrito algo.
  if (search.trim().length > 0) {
    // 1. Se prepara el parámetro de búsqueda para que coincida desde el inicio.
    // Se elimina el primer '%' del `ILIKE`. Ahora es 'texto%' en lugar de '%texto%'.
    const searchTerm = `${search.trim()}%`;
    queryParams.push(searchTerm); // Se añade a los parámetros.

    // 2. Se construye la cláusula WHERE.
    // La lógica ahora es: (El nombre completo EMPIEZA CON el texto) O (La cédula EMPIEZA CON el texto)
    const searchClause = ` AND ((p.pacie_ape_pacie || ' ' || p.pacie_nom_pacie) ILIKE $${paramIndex} OR p.pacie_ced_pacie ILIKE $${paramIndex})`;
    paramIndex++; // Se incrementa el índice del parámetro.

    // 3. Se añade la cláusula a las consultas.
    queryText += searchClause;
    countQueryText += searchClause;
  }

  // --- LÓGICA DE FILTRADO POR EMPRESAS (sin cambios) ---
  if (userCompanies && userCompanies.length > 0) {
    // console.log(
    //   "DEBUG MODEL (getAllPacientes): Aplicando filtro por empresas:",
    //   userCompanies
    // d);
    queryText += ` AND p.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
    countQueryText += ` AND p.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
    queryParams.push(userCompanies);
    paramIndex++;
  } else {
    //console.warn(
    //  "DEBUG MODEL (getAllPacientes): userCompanies está vacío o nulo. Se aplicará 'AND FALSE'."
    //);
    queryText += ` AND FALSE`;
    countQueryText += ` AND FALSE`;
  }

  // --- ORDENAMIENTO Y PAGINACIÓN (sin cambios) ---
  queryText += ` ORDER BY p.pacie_ape_pacie, p.pacie_nom_pacie LIMIT $${paramIndex} OFFSET $${
    paramIndex + 1
  }`;
  queryParams.push(limit, offset);

  // --- EJECUCIÓN DE CONSULTAS ---
  //console.log("--- DEBUG getAllPacientes Model (FINAL) ---");
  //console.log("Query de texto:", queryText);
  //console.log("Parámetros:", queryParams);
  //console.log("--- FIN DEBUG getAllPacientes Model (FINAL) ---");

  try {
    const { rows } = await db.query(queryText, queryParams);
    const { rows: countRows } = await db.query(
      countQueryText,
      queryParams.slice(0, paramIndex - 1)
    );

    return {
      pacientes: rows,
      total: parseInt(countRows[0].total, 10),
    };
  } catch (error) {
    console.error(
      "Error en la consulta SQL de getAllPacientes:",
      error.message
    );
    throw error;
  }
};

// Obtener un paciente por ID
export const getPacienteById = async (id, userCompanies = []) => {
  // Recibe userCompanies
  //  console.log(
  //    "DEBUG MODEL (getPacienteById): userCompanies recibido:",
  //    userCompanies
  //  ); // Log

  let queryText = `SELECT p.*, s.sexo_nom_sexo, e.empr_nom_empr
FROM dispensario.dmpacie p
LEFT JOIN dispensario.dmsexo s ON p.pacie_cod_sexo = s.sexo_cod_sexo
JOIN dispensario.dmempr e ON p.pacie_cod_empr = e.empr_cod_empr
WHERE p.pacie_cod_pacie = $1`;

  const queryParams = [id];
  let paramIndex = 2;

  if (userCompanies && userCompanies.length > 0) {
    queryText += ` AND p.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
    queryParams.push(userCompanies);
  } else {
  //  console.warn(
  //    "DEBUG MODEL (getPacienteById): userCompanies está vacío o nulo. Devolviendo null."
  //  );
    return null;
  }

//  console.log("--- DEBUG getPacienteById Model (FINAL) ---"); // Log de la query final
//  console.log("Query de texto:", queryText);
//  console.log("Parámetros:", queryParams);
//  console.log("--- FIN DEBUG getPacienteById Model (FINAL) ---");

  try {
    const { rows } = await db.query(queryText, queryParams);
    return rows[0];
  } catch (error) {
    console.error(
      "Error en la consulta SQL de getPacienteById:",
      error.message
    );
    throw error;
  }
};

// Crear un nuevo paciente
export const createPaciente = async (paciente) => {
  // Desestructurar todos los campos que se van a insertar, en el orden de la consulta SQL.
  // Esto es CRÍTICO para asegurar que los valores se pasen en el orden correcto a la query.
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
  } = paciente; // Asegúrate de que 'paciente' tiene todas estas propiedades

  // La cadena SQL debe ser construida sin espacios iniciales en la primera línea.
  const query = `INSERT INTO dispensario.dmpacie (
pacie_ced_pacie, pacie_cod_empr, pacie_tip_pacie, pacie_emp_famil, pacie_nom_pacie,
pacie_ape_pacie, pacie_dir_pacie, pacie_parr_pacie, pacie_barr_pacie, pacie_tel_pacie,
pacie_zon_pacie, pacie_cod_sexo, pacie_cod_estc, pacie_cod_relig, pacie_cod_pais,
pacie_fec_nac, pacie_parr_nacim, pacie_emai_pacie, pacie_cod_inst, pacie_cod_disc,
pacie_por_disc, pacie_nom_cont, pacie_dir_cont, pacie_tel_con, pacie_cod_etnia,
pacie_enf_catas, pacie_cod_sangr, pacie_cod_osex, pacie_cod_gener, pacie_late_pacie,
pacie_est_pacie
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31) RETURNING *`;

  // El array de valores debe coincidir con el orden de las columnas en la consulta.
  const values = [
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
  ];

  console.log("DEBUG createPaciente Query:", query);
  console.log("DEBUG createPaciente Values:", values); // Usar el array 'values'

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error("Error en la consulta SQL de createPaciente:", error.message);
    throw error;
  }
};

// Actualizar un paciente
export const updatePaciente = async (id, paciente) => {
  // Desestructurar todos los campos que se van a actualizar, en el orden de la consulta SQL.
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

  // La cadena SQL debe ser construida sin espacios iniciales en la primera línea.
  const query = `UPDATE dispensario.dmpacie SET
pacie_ced_pacie = $1, pacie_cod_empr = $2, pacie_tip_pacie = $3,
pacie_emp_famil = $4, pacie_nom_pacie = $5, pacie_ape_pacie = $6,
pacie_dir_pacie = $7, pacie_parr_pacie = $8, pacie_barr_pacie = $9,
pacie_tel_pacie = $10, pacie_zon_pacie = $11, pacie_cod_sexo = $12,
pacie_cod_estc = $13, pacie_cod_relig = $14, pacie_cod_pais = $15,
pacie_fec_nac = $16, pacie_parr_nacim = $17, pacie_emai_pacie = $18,
pacie_cod_inst = $19, pacie_cod_disc = $20, pacie_por_disc = $21,
pacie_nom_cont = $22, pacie_dir_cont = $23, pacie_tel_con = $24,
pacie_cod_etnia = $25, pacie_enf_catas = $26, pacie_cod_sangr = $27,
pacie_cod_osex = $28, pacie_cod_gener = $29, pacie_late_pacie = $30,
pacie_est_pacie = $31
WHERE pacie_cod_pacie = $32 RETURNING *`;

  // El array de valores debe coincidir con el orden de las columnas en la consulta.
  // El 'id' del paciente a actualizar va al final para $32.
  const values = [
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
    id, // Este es el ID del paciente para la cláusula WHERE
  ];

  console.log("DEBUG updatePaciente Query:", query);
  console.log("DEBUG updatePaciente Values:", values); // Usar el array 'values'

  try {
    const { rows } = await db.query(query, values);
    return rows[0];
  } catch (error) {
    console.error("Error en la consulta SQL de updatePaciente:", error.message);
    throw error;
  }
};

// Eliminar un paciente (cambiar estado a 'I')
export const deletePaciente = async (id) => {
  const { rows } = await db.query(
    "UPDATE dispensario.dmpacie SET pacie_est_pacie = $1 WHERE pacie_cod_pacie = $2 RETURNING *",
    ["I", id]
  );
  return rows[0];
};

// Obtener todos los tipos de pacientes
export const getAllTiposPacientes = async () => {
  const { rows } = await db.query(
    "SELECT tipa_cod_tipa, tipa_nom_tipa FROM dispensario.dmtipa"
  );
  return rows;
};

// Obtener todas las zonas
export const getAllZonas = async () => {
  const { rows } = await db.query(
    "SELECT zona_cod_zona, zona_nom_zona FROM dispensario.dmzona"
  );
  return rows;
};

// Obtener todos los sexos
export const getAllSexos = async () => {
  const { rows } = await db.query(
    "SELECT sexo_cod_sexo, sexo_nom_sexo FROM dispensario.dmsexo"
  );
  return rows;
};

// Obtener todos los estados civiles
export const getAllEstadosCiviles = async () => {
  const { rows } = await db.query(
    "SELECT estci_cod_estc, estci_nom_estc FROM dispensario.dmestci"
  );
  return rows;
};

// Obtener todas las religiones
export const getAllReligiones = async () => {
  const { rows } = await db.query(
    "SELECT relig_cod_relig, relig_nom_relig FROM dispensario.dmrelig"
  );
  return rows;
};

// Obtener todos los países
export const getAllPaises = async () => {
  const { rows } = await db.query(
    "SELECT pais_cod_pais, pais_nom_pais FROM dispensario.dmpais"
  );
  return rows;
};

// Obtener todas las etnias
export const getAllEtnias = async () => {
  const { rows } = await db.query(
    "SELECT etnia_cod_etnia, etnia_nom_etnia FROM dispensario.dmetnia"
  );
  return rows;
};

// Obtener todas las orientaciones sexuales
export const getAllOrientacionesSexuales = async () => {
  const { rows } = await db.query(
    "SELECT dmosex_cod_osex, dmosex_nom_osex FROM dispensario.dmosex"
  );
  return rows;
};

// Obtener todos los géneros
export const getAllGeneros = async () => {
  const { rows } = await db.query(
    "SELECT idgen_cod_idgen, idgen_nom_idgen FROM dispensario.dmidgen"
  );
  return rows;
};

// Obtener todas las lateralidades
export const getAllLateralidades = async () => {
  const { rows } = await db.query(
    "SELECT later_cod_later, later_nom_later FROM dispensario.dmlater"
  );
  return rows;
};

// Obtener todas las instituciones
export const getAllInstrucciones = async () => {
  const { rows } = await db.query(
    "SELECT instr_cod_inst, instr_nom_inst FROM dispensario.dminstr"
  );
  return rows;
};

// Obtener todos los tipos de sangre
export const getAllTiposSangre = async () => {
  const { rows } = await db.query(
    "SELECT tisan_cod_tisa, tisan_nom_tisa FROM dispensario.dmtisan"
  );
  return rows;
};
// Obtener todos los tipos de sangre
export const getAllEmpresas = async () => {
  const { rows } = await db.query(
    "SELECT empr_cod_empr, empr_nom_empr FROM dispensario.dmempr"
  );
  return rows;
};
// Obtener todos los tipos de sangre
export const getAllDiscapacidades = async () => {
  const { rows } = await db.query(
    "SELECT disc_cod_disc, disc_nom_disc FROM dispensario.dmdisc"
  );
  return rows;
};

// Verificar si una cédula ya existe
export const verificarCedulaExistente = async (cedula, pacienteId = null) => {
  let query =
    "SELECT pacie_cod_pacie FROM dispensario.dmpacie WHERE pacie_ced_pacie = $1";
  const params = [cedula];
  if (pacienteId) {
    query += " AND pacie_cod_pacie != $2";
    params.push(pacienteId);
  }
  const { rows } = await db.query(query, params);
  return rows.length > 0;
};
