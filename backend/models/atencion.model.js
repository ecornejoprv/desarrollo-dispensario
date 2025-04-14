import { db } from '../database/databasePostgres.js';

// 1. Funciones relacionadas con la obtención de atenciones
export const getAtencionesByPacienteId = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmatenc 
    WHERE aten_cod_paci = $1
    ORDER BY aten_fec_aten DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

export const getAtencionById = async (atencionId) => {
  const query = `
    SELECT * FROM dispensario.dmatenc 
    WHERE aten_cod_aten = $1;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows[0];
};

export const getAtencionesByPacienteIdAndEspecialidad = async (pacienteId, especialidad, limit, offset, orden = 'desc') => {
  let query;
  let params;

  if (especialidad === "Todas") {
    query = `
      SELECT * FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1
      ORDER BY aten_fec_aten ${orden === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3;
    `;
    params = [pacienteId, limit, offset];
  } else {
    query = `
      SELECT * FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1 AND aten_esp_aten = $2
      ORDER BY aten_fec_aten ${orden === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $3 OFFSET $4;
    `;
    params = [pacienteId, especialidad, limit, offset];
  }

  const { rows } = await db.query(query, params);
  return rows;
};

export const getTotalAtencionesByPacienteIdAndEspecialidad = async (pacienteId, especialidad) => {
  let query;
  let params;

  if (especialidad === "Todas") {
    query = `
      SELECT COUNT(*) as total FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1;
    `;
    params = [pacienteId];
  } else {
    query = `
      SELECT COUNT(*) as total FROM dispensario.dmatenc 
      WHERE aten_cod_paci = $1 AND aten_esp_aten = $2;
    `;
    params = [pacienteId, especialidad];
  }

  const { rows } = await db.query(query, params);
  return rows[0].total;
};

// 2. Funciones relacionadas con citas y triajes
export const validarCitaPendienteConTriaje = async (pacienteId) => {
  const query = `
    SELECT 
      c.cita_cod_cita,
      c.cita_cod_pacie,
      c.cita_fec_cita,
      c.cita_hor_cita,
      c.cita_cod_medi,
      c.cita_cod_sucu,
      t.triaj_niv_urge,
      t.triaj_sig_vita,
      t.triaj_obs_triaj
    FROM dispensario.dmcita c
    LEFT JOIN dispensario.dmtriaj t ON c.cita_cod_cita = t.triaj_cod_cita
    WHERE c.cita_cod_pacie = $1 
      AND c.cita_est_cita = 'PE'
      AND t.triaj_cod_triaj IS NOT NULL
    LIMIT 1;
  `;

  const { rows } = await db.query(query, [pacienteId]);
  return rows[0]; // Devuelve la cita con triaje si existe, o undefined si no existe
};

// 3. Funciones relacionadas con el registro de atenciones
export const registrarAtencion = async (atencionData) => {
  const {
    aten_cod_paci,
    aten_cod_cita,
    aten_cod_medi,
    aten_cod_disu,
    aten_esp_aten,
    aten_fec_aten,
    aten_hor_aten,
    aten_mot_cons,
    aten_enf_actu,
    aten_obs_ate,
    aten_cert_aten,
    aten_num_sesi,
  } = atencionData;

  // Verificar si el paciente ya tiene atenciones en la misma especialidad
  const queryVerificarAtenciones = `
    SELECT COUNT(*) as total 
    FROM dispensario.dmatenc 
    WHERE aten_cod_paci = $1 AND aten_esp_aten = $2;
  `;

  const { rows } = await db.query(queryVerificarAtenciones, [aten_cod_paci, aten_esp_aten]);
  const totalAtenciones = rows[0].total;

  // Determinar el tipo de atención
  const aten_tip_aten = totalAtenciones === 0 ? 'Primera' : 'Subsecuente';

  // Insertar la atención
  const queryInsertarAtencion = `
    INSERT INTO dispensario.dmatenc (
      aten_cod_paci,
      aten_cod_cita,
      aten_cod_medi,
      aten_cod_disu,
      aten_esp_aten,
      aten_fec_aten,
      aten_hor_aten,
      aten_mot_cons,
      aten_enf_actu,
      aten_obs_ate,
      aten_tip_aten,
      aten_cert_aten,
      aten_num_sesi
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    RETURNING *;
  `;

  const { rows: atencionRows } = await db.query(queryInsertarAtencion, [
    aten_cod_paci,
    aten_cod_cita,
    aten_cod_medi,
    aten_cod_disu,
    aten_esp_aten,
    aten_fec_aten,
    aten_hor_aten,
    aten_mot_cons,
    aten_enf_actu,
    aten_obs_ate,
    aten_tip_aten,
    aten_cert_aten,
    aten_num_sesi,
  ]);

  return atencionRows[0]; // Devuelve la atención registrada
};

// 4. Funciones adicionales (opcional)
export const getCitasPendientesPorMedico = async (medicoId) => {
  const query = `
    SELECT 
      c.cita_cod_cita,
      c.cita_cod_pacie,
      c.cita_fec_cita,
      c.cita_hor_cita,
      c.cita_cod_medi,
      c.cita_cod_sucu,
      p.pacie_nom_pacie,
      p.pacie_ape_pacie,
      p.pacie_ced_pacie,
      t.triaj_niv_urge,
      t.triaj_par_triaj,
      t.triaj_tem_triaj,
      t.triaj_obs_triaj,
      t.triaj_fca_triaj,
      t.triaj_sat_triaj,
      t.triaj_fre_triaj,
      t.triaj_pes_triaj,
      t.triaj_tal_triaj,
      t.triaj_imc_triaj,
      t.triaj_pab_triaj
    FROM dispensario.dmcita c
    LEFT JOIN dispensario.dmpacie p ON c.cita_cod_pacie = p.pacie_cod_pacie
    LEFT JOIN dispensario.dmtriaj t ON c.cita_cod_cita = t.triaj_cod_cita
    WHERE c.cita_cod_medi = $1 
      AND c.cita_est_cita = 'PE';
  `;

  const { rows } = await db.query(query, [medicoId]);
  return rows;
};

// 5. Funciones para actualizar el estado de la cita
export const actualizarEstadoCita = async (citaId, nuevoEstado) => {
  const query = `
    UPDATE dispensario.dmcita 
    SET cita_est_cita = $1
    WHERE cita_cod_cita = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [nuevoEstado, citaId]);
  return rows[0];
};

export const getAtencionesByMedicoAndDates = async (medicoId, fechaInicio, fechaFin, limit, offset) => {
  // Validación de parámetros
  if (isNaN(limit)) throw new Error("Limit debe ser número");
  if (isNaN(offset)) throw new Error("Offset debe ser número");
  
  let query = `
    SELECT 
      a.*,
      p.pacie_nom_pacie,
      p.pacie_ape_pacie,
      p.pacie_ced_pacie,
      m.medic_nom_medic,
      e.espe_nom_espe
    FROM dispensario.dmatenc a
    JOIN dispensario.dmpacie p ON a.aten_cod_paci = p.pacie_cod_pacie
    JOIN dispensario.dmmedic m ON a.aten_cod_medi = m.medic_cod_medic
    LEFT JOIN dispensario.dmespec e ON m.medic_cod_espe = e.espe_cod_espe
    WHERE a.aten_fec_aten BETWEEN $1::date AND $2::date
  `;
  
  let params = [fechaInicio, fechaFin];
  
  if (medicoId) {
    query += ` AND a.aten_cod_medi = $${params.length + 1}`;
    params.push(medicoId);
  }
  
  query += `
    ORDER BY a.aten_fec_aten DESC, a.aten_hor_aten DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  params.push(parseInt(limit), parseInt(offset));

  console.log("Consulta SQL:", { query, params });

  try {
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error("Error en consulta:", error);
    throw new Error(`Error al obtener atenciones: ${error.message}`);
  }
};

export const countAtencionesByMedicoAndDates = async (medicoId, fechaInicio, fechaFin) => {
  const query = `
    SELECT COUNT(*) as total 
    FROM dispensario.dmatenc
    WHERE aten_cod_medi = $1 
      AND aten_fec_aten BETWEEN $2 AND $3;
  `;
  const { rows } = await db.query(query, [medicoId, fechaInicio, fechaFin]);
  return parseInt(rows[0].total);
};

export const getEstadisticasAtenciones = async (medicoId, fechaInicio, fechaFin) => {
  const query = `
    SELECT 
      aten_esp_aten as especialidad,
      COUNT(*) as total,
      SUM(CASE WHEN aten_tip_aten = 'Primera' THEN 1 ELSE 0 END) as primeras,
      SUM(CASE WHEN aten_tip_aten = 'Subsecuente' THEN 1 ELSE 0 END) as subsecuentes
    FROM dispensario.dmatenc
    WHERE aten_cod_medi = $1 
      AND aten_fec_aten BETWEEN $2 AND $3
    GROUP BY aten_esp_aten;
  `;
  const { rows } = await db.query(query, [medicoId, fechaInicio, fechaFin]);
  return rows;
};

export const getAtencionesPorFechas = async (fechaInicio, fechaFin, medicoId, limit, offset) => {
  let query = `
    SELECT 
      a.*,
      p.pacie_nom_pacie,
      p.pacie_ape_pacie,
      p.pacie_ced_pacie,
      m.medic_nom_medic,
      e.espe_nom_espe
    FROM dispensario.dmatenc a
    JOIN dispensario.dmpacie p ON a.aten_cod_paci = p.pacie_cod_pacie
    JOIN dispensario.dmmedic m ON a.aten_cod_medi = m.medic_cod_medic
    LEFT JOIN dispensario.dmespec e ON m.medic_cod_espe = e.espe_cod_espe
    WHERE a.aten_fec_aten BETWEEN $1 AND $2
  `;
  
  let params = [fechaInicio, fechaFin];
  
  if (medicoId) {
    query += ` AND a.aten_cod_medi = $${params.length + 1}`;
    params.push(medicoId);
  }
  
  query += `
    ORDER BY a.aten_fec_aten DESC, a.aten_hor_aten DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  params.push(limit, offset);
  console.log('Params a enviar a DB:', {
    fechaInicio,
    fechaFin,
    medicoId: medicoIdNumber,
    limit: parseInt(limit),
    offset: parseInt(offset)
  });
  
  try {
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error en getAtencionesPorFechas:', error);
    throw new Error(`Error en consulta: ${error.message}`);
  }
};

export const countAtencionesPorFechas = async (fechaInicio, fechaFin, medicoId) => {
  let query = `
    SELECT COUNT(*) as total 
    FROM dispensario.dmatenc
    WHERE aten_fec_aten BETWEEN $1::date AND $2::date
  `;
  
  let params = [fechaInicio, fechaFin];
  
  if (medicoId) {
    query += ` AND aten_cod_medi = $${params.length + 1}`;
    params.push(medicoId);
  }
  
  const { rows } = await db.query(query, params);
  return parseInt(rows[0].total);
};