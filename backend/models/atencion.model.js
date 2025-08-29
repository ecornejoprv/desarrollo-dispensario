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
      SELECT a.*, m.medic_nom_medic 
      FROM dispensario.dmatenc a
      JOIN dispensario.dmmedic m ON a.aten_cod_medi = m.medic_cod_medic
      WHERE a.aten_cod_paci = $1
      ORDER BY a.aten_fec_aten ${orden === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $2 OFFSET $3;
    `;
    params = [pacienteId, limit, offset];
  } else {
    query = `
      SELECT a.*, m.medic_nom_medic 
      FROM dispensario.dmatenc a
      JOIN dispensario.dmmedic m ON a.aten_cod_medi = m.medic_cod_medic
      WHERE a.aten_cod_paci = $1 AND a.aten_esp_aten = $2
      ORDER BY a.aten_fec_aten ${orden === 'asc' ? 'ASC' : 'DESC'}
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
    aten_tip_aten
  } = atencionData;

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

export const asignarNumeroReceta = async (atencionId, numeroReceta) => {
  const query = `
    UPDATE dispensario.dmatenc
    SET aten_num_receta = $1
    WHERE aten_cod_aten = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [numeroReceta, atencionId]);
  return rows[0];
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
      AND c.cita_est_cita = 'PE'
    ORDER BY c.cita_cod_cita ASC;
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
    sex.sexo_nom_sexo,
    m.medic_nom_medic,
    e.espe_nom_espe,
    emp.empr_nom_empr,
    ARRAY_AGG(
      JSON_BUILD_OBJECT(
        'codigo', c.cie10_id_cie10,
        'nombre', c.cie10_nom_cie10
      )
    ) FILTER (WHERE d.diag_cod_diag IS NOT NULL) as diagnosticos
  FROM dispensario.dmatenc a
  JOIN dispensario.dmpacie p ON a.aten_cod_paci = p.pacie_cod_pacie
  JOIN dispensario.dmmedic m ON a.aten_cod_medi = m.medic_cod_medic
  LEFT JOIN dispensario.dmespec e ON m.medic_cod_espe = e.espe_cod_espe
  LEFT JOIN dispensario.dmsexo sex ON p.pacie_cod_sexo = sex.sexo_cod_sexo
  LEFT JOIN dispensario.dmempr emp ON p.pacie_cod_empr = emp.empr_cod_empr
  LEFT JOIN dispensario.dmdiag d ON a.aten_cod_aten = d.diag_cod_aten
  LEFT JOIN dispensario.dmcie10 c ON d.diag_cod_cie10 = c.cie10_cod_cie10
  WHERE a.aten_fec_aten BETWEEN $1::date AND $2::date
`;
  
  let params = [fechaInicio, fechaFin];
  
  if (medicoId) {
    query += ` AND a.aten_cod_medi = $${params.length + 1}`;
    params.push(medicoId);
  }
  
  query += `
    GROUP BY 
      a.aten_cod_aten, 
      p.pacie_nom_pacie, 
      p.pacie_ape_pacie, 
      p.pacie_ced_pacie, 
      sex.sexo_nom_sexo,
      m.medic_nom_medic, 
      e.espe_nom_espe,
      emp.empr_nom_empr
    ORDER BY a.aten_fec_aten DESC, a.aten_hor_aten DESC
    LIMIT $${params.length + 1} OFFSET $${params.length + 2}
  `;
  
  params.push(parseInt(limit), parseInt(offset));
  
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

export const getPreventivaByAtencionId = async (atencionId) => {
  const query = `
    SELECT * FROM dispensario.dmpreven 
    WHERE prev_cod_aten = $1;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows[0] || null;
};

export const getVigilanciasByAtencionId = async (atencionId) => {
  const query = `
    SELECT vigi_tip_vigi FROM dispensario.dmvigil 
    WHERE vigi_cod_aten = $1;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows.map(row => row.vigi_tip_vigi);
};

export const getMorbilidadByAtencionId = async (atencionId) => {
  // --- CONSULTA SQL CORREGIDA Y DEFINITIVA ---
  const query = `
    SELECT
      m.morb_tip_morb,
      -- CORRECCIÓN CLAVE: Se usa 'text[]' que es un tipo de dato estándar
      -- en lugar del tipo personalizado 'dispensario.sistema_tipo[]'.
      COALESCE(
        ARRAY_AGG(s.sist_nom_sist) FILTER (WHERE s.sist_nom_sist IS NOT NULL),
        '{}'::text[] 
      ) AS sistemas_afectados
    FROM 
      dispensario.dmmorbi m
    LEFT JOIN
      dispensario.dmsiste s ON m.morb_cod_morb = s.sist_cod_morb 
    WHERE 
      m.morb_cod_aten = $1
    GROUP BY
      m.morb_cod_morb, m.morb_tip_morb;
  `;
  try {
    // Se ejecuta la consulta con el ID de la atención.
    const { rows } = await db.query(query, [atencionId]);
    
    // Se devuelve el primer resultado encontrado o null.
    return rows[0] || null;
  } catch (error) {
    // Se captura y muestra cualquier error de la base de datos.
    console.error('ERROR DETALLADO DEL BACKEND en getMorbilidadByAtencionId:', error);
    throw new Error('Error en la base de datos al obtener datos de morbilidad.');
  }
};

export const getPrescripcionesByAtencionId = async (atencionId) => {
  const query = `
    SELECT * FROM dispensario.dmpresc 
    WHERE pres_cod_aten = $1
    ORDER BY pres_cod_pres;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows;
};

export const getIndicacionesByAtencionId = async (atencionId) => {
  const query = `
    SELECT * FROM dispensario.dmindic 
    WHERE indi_cod_aten = $1
    ORDER BY indi_cod_indi;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows;
};

export const getSignosAlarmaByAtencionId = async (atencionId) => {
  const query = `
    SELECT * FROM dispensario.dmsigna 
    WHERE signa_cod_aten = $1
    ORDER BY signa_cod_signa;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows;
};

export const getReferenciasByAtencionId = async (atencionId) => {
  const query = `
    SELECT * FROM dispensario.dmrefer 
    WHERE refe_cod_aten = $1
    ORDER BY refe_cod_refe;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows;
};

export const getTriajeByAtencionId = async (atencionId) => {
  const query = `
    SELECT t.*
    FROM dispensario.dmatenc a
    JOIN dispensario.dmtriaj t ON a.aten_cod_cita = t.triaj_cod_cita
    WHERE t.triaj_fec_triaj is not null and a.aten_cod_aten = $1
    ORDER BY t.triaj_fec_triaj DESC
    LIMIT 1;
  `;
  const { rows } = await db.query(query, [atencionId]);
  return rows[0] || null; // Devuelve el objeto de triaje o null si no se encuentra
};

export const getReporteEnfermeria = async (filters = {}, userCompanies = []) => {
  // Se desestructuran todos los posibles filtros.
  const { fechaDesde, fechaHasta, medicoId, page = 1, limit = 10 } = filters;
  const offset = (page - 1) * limit;

  // Se prepara la base de la consulta WHERE que será común para todas las queries.
  let whereClause = ` WHERE act.acti_tip_acti IN ('POSTCONSULTA', 'ADMINISTRATIVAS') `;
  const params = [];
  let paramIndex = 1;

  // Se añaden los filtros dinámicos a la cláusula WHERE y al array de parámetros.
  if (userCompanies && userCompanies.length > 0) {
    whereClause += ` AND pac.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
    params.push(userCompanies);
    paramIndex++;
  } else {
    return { reporteData: [], total: 0, totalPostConsulta: 0, totalGeneral: 0 }; // Devuelve ceros si no hay empresas
  }
  if (fechaDesde) {
    whereClause += ` AND p.post_fec_post::date >= $${paramIndex}::date`;
    params.push(fechaDesde);
    paramIndex++;
  }
  if (fechaHasta) {
    whereClause += ` AND p.post_fec_post::date <= $${paramIndex}::date`;
    params.push(fechaHasta);
    paramIndex++;
  }
  if (medicoId) {
    whereClause += ` AND p.post_cod_medi = $${paramIndex}`;
    params.push(medicoId);
    paramIndex++;
  }
  
  // --- NUEVA CONSULTA DE CONTEO AVANZADA ---
  // Esta única consulta calcula los 3 totales que necesitamos usando filtros condicionales.
  const countQuery = `
    SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE p.post_cod_cita IS NOT NULL) AS post_consulta_count,
        COUNT(*) FILTER (WHERE p.post_cod_cita IS NULL) AS general_count
    FROM dispensario.dmpost p
    LEFT JOIN dispensario.dmpacie pac ON p.post_cod_pacie = pac.pacie_cod_pacie
    LEFT JOIN dispensario.dmacti act ON p.post_cod_acti = act.acti_cod_acti
    ${whereClause}
  `;
  
  // La consulta de datos paginados sigue siendo la misma, pero reutiliza la cláusula WHERE.
  const dataQuery = `
    SELECT
      p.post_cod_post, p.post_fec_post,
      pac.pacie_nom_pacie || ' ' || pac.pacie_ape_pacie AS paciente_nombre_completo,
      med.medic_nom_medic AS profesional_nombre,
      act.acti_nom_acti AS actividad_nombre,
      p.post_obs_post AS observaciones,
      CASE WHEN p.post_cod_cita IS NOT NULL THEN 'Post-Consulta (Cita)' ELSE 'Actividad General' END AS tipo_registro
    FROM 
      dispensario.dmpost p
      LEFT JOIN dispensario.dmpacie pac ON p.post_cod_pacie = pac.pacie_cod_pacie
      LEFT JOIN dispensario.dmmedic med ON p.post_cod_medi = med.medic_cod_medic
      LEFT JOIN dispensario.dmacti act ON p.post_cod_acti = act.acti_cod_acti
    ${whereClause}
    ORDER BY p.post_fec_post DESC
    LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
  `;
  const dataParams = [...params, limit, offset];
  
  try {
    // Se ejecutan ambas consultas en paralelo.
    const [totalResult, dataResult] = await Promise.all([
      db.query(countQuery, params),
      db.query(dataQuery, dataParams)
    ]);

    // Se extraen los resultados y se devuelven en un objeto estructurado.
    const totals = totalResult.rows[0];
    return { 
      reporteData: dataResult.rows, 
      total: parseInt(totals.total, 10),
      totalPostConsulta: parseInt(totals.post_consulta_count, 10),
      totalGeneral: parseInt(totals.general_count, 10)
    };
  } catch (error) {
    console.error('Error en la consulta del reporte de enfermería:', error.message);
    throw new Error(`Error al generar el reporte de enfermería: ${error.message}`);
  }
};