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
      aten_cert_aten
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
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