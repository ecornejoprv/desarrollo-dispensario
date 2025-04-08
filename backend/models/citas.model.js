import { db } from '../database/databasePostgres.js'; // Importa la conexión a PostgreSQL

// Obtener todas las citas
export const getCitas = async () => {
  const query = "SELECT * FROM dispensario.dmcita where cita_est_cita <> 'AM'";
  const result = await db.query(query);
  return result.rows;
};

// Actualizar solo el estado de una cita
export const updateEstadoCita = async (cita_cod_cita, estado) => {
  const query = `
    UPDATE dispensario.dmcita
    SET cita_est_cita = $1
    WHERE cita_cod_cita = $2
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [estado, cita_cod_cita]);
    return result.rows[0];
  } catch (error) {
    console.error('Error al actualizar estado de cita:', error);
    throw new Error(`Error al actualizar estado de cita: ${error.message}`);
  }
};

// Obtener una cita por su ID
export const getCitaById = async (cita_cod_cita) => {
  const query = 'SELECT * FROM dispensario.dmcita WHERE cita_cod_cita = $1';
  const result = await db.query(query, [cita_cod_cita]);
  return result.rows[0];
};

// Verificar disponibilidad de la cita de manera más eficiente
export const isCitaDisponible = async (cita) => {
  const {
    cita_cod_sucu,
    cita_cod_espe,
    cita_hor_cita,
    cita_fec_cita,
    cita_cod_medi,
    cita_cod_cita = null, // Permitir excluir una cita en actualización
  } = cita;

  const query = `
    SELECT EXISTS (
      SELECT 1 FROM dispensario.dmcita 
      WHERE cita_cod_sucu = $1 
        AND cita_cod_espe = $2 
        AND cita_hor_cita = $3 
        AND cita_fec_cita = $4
        AND cita_cod_medi = $5
        ${cita_cod_cita ? 'AND cita_cod_cita <> $6' : ''}
    ) AS disponible;
  `;

  const values = cita_cod_cita
    ? [cita_cod_sucu, cita_cod_espe, cita_hor_cita, cita_fec_cita, cita_cod_medi, cita_cod_cita]
    : [cita_cod_sucu, cita_cod_espe, cita_hor_cita, cita_fec_cita, cita_cod_medi];

  try {
    const result = await db.query(query, values);
    return !result.rows[0].disponible; // `EXISTS` devuelve true si hay una cita, negamos para disponibilidad
  } catch (error) {
    console.error('Error al verificar disponibilidad de la cita:', error);
    throw new Error(`Error al verificar disponibilidad: ${error.message}`);
  }
};

// Crear una nueva cita
export const createCita = async (cita) => {
  const {
    cita_cod_pacie,
    cita_cod_sucu,
    cita_cod_espe,
    cita_hor_cita,
    cita_fec_cita,
    cita_cod_medi,
  } = cita;

  if (!(await isCitaDisponible(cita))) {
    throw new Error('La cita no está disponible en este horario.');
  }

  const query = `
    INSERT INTO dispensario.dmcita (
      cita_cod_pacie, cita_cod_sucu, cita_cod_espe, 
      cita_hor_cita, cita_fec_cita, cita_cod_medi
    ) VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [
      cita_cod_pacie,
      cita_cod_sucu,
      cita_cod_espe,
      cita_hor_cita,
      cita_fec_cita,
      cita_cod_medi,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error al crear la cita:', error);
    throw new Error(`Error al guardar la cita: ${error.message}`);
  }
};

// Actualizar una cita existente
export const updateCita = async (cita_cod_cita, cita) => {
  const disponible = await isCitaDisponible({ ...cita, cita_cod_cita });

  if (!disponible) {
    throw new Error('La cita no está disponible en este horario.');
  }

  const query = `
    UPDATE dispensario.dmcita
    SET cita_cod_pacie = $1, cita_cod_sucu = $2, cita_cod_espe = $3, 
        cita_hor_cita = $4, cita_fec_cita = $5, cita_cod_medi = $6
    WHERE cita_cod_cita = $7
    RETURNING *;
  `;

  try {
    const result = await db.query(query, [
      cita.cita_cod_pacie,
      cita.cita_cod_sucu,
      cita.cita_cod_espe,
      cita.cita_hor_cita,
      cita.cita_fec_cita,
      cita.cita_cod_medi,
      cita_cod_cita,
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('Error al actualizar la cita:', error);
    throw new Error(`Error al actualizar la cita: ${error.message}`);
  }
};

// Eliminar una cita
export const deleteCita = async (cita_cod_cita) => {
  const query = 'DELETE FROM dispensario.dmcita WHERE cita_cod_cita = $1 RETURNING *';
  try {
    const result = await db.query(query, [cita_cod_cita]);
    return result.rows[0];
  } catch (error) {
    console.error('Error al eliminar la cita:', error);
    throw new Error(`Error al eliminar la cita: ${error.message}`);
  }
};

// Obtener todas las especialidades
export const getAllEspecialidades = async () => {
  const query = 'SELECT espe_cod_espe, espe_nom_espe FROM dispensario.dmespec';
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener especialidades:', error);
    throw new Error('Error al obtener especialidades');
  }
};

// Obtener todos los lugares de atención
export const getAllLugaresAtencion = async () => {
  const query = 'SELECT disuc_cod_disuc, disuc_nom_disuc FROM dispensario.dmdisuc';
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener lugares de atención:', error);
    throw new Error('Error al obtener lugares de atención');
  }
};

// Obtener todos los médicos activos
export const getAllMedicos = async () => {
  const query = `
    SELECT medic_cod_medic, medic_nom_medic 
    FROM dispensario.dmmedic 
    WHERE medic_est_medic = 'AC'
  `;
  try {
    const { rows } = await db.query(query);
    return rows;
  } catch (error) {
    console.error('Error al obtener médicos:', error);
    throw new Error('Error al obtener médicos');
  }
};

// Obtener médicos por especialidad
export const getMedicosPorEspecialidad = async (especialidadId) => {
  const query = `
    SELECT medic_cod_medic, medic_nom_medic 
    FROM dispensario.dmmedic 
    WHERE medic_cod_espe = $1 AND medic_est_medic = 'AC';
  `;
  try {
    const { rows } = await db.query(query, [especialidadId]);
    return rows;
  } catch (error) {
    console.error('Error al obtener médicos por especialidad:', error);
    throw new Error('Error al obtener médicos por especialidad');
  }
};

// En tu controlador de actividades
export const getActividadesByTipo = async (tipo) => {
  try {
    const query = `
      SELECT * FROM dispensario.dmacti 
      WHERE acti_tip_acti = $1
      ORDER BY acti_nom_acti ASC`;
    const { rows } = await db.query(query, [tipo]);
    return rows;
  } catch (error) {
    console.error('Error al obtener actividades:', error);
    throw new Error('Error al obtener actividades');
  }
};
// Registrar actividades en postconsulta - VERSIÓN MEJORADA
export const registrarActividadesPost = async (medicoId, actividades, citaId = null, pacienteId = null) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    
    const fechaActual = new Date().toISOString().split('T')[0];
    
    // Validar que actividades sea un array
    if (!Array.isArray(actividades)) {
      throw new Error('El parámetro actividades debe ser un array');
    }

    // Insertar cada actividad como un registro independiente
    const actividadesRegistradas = [];
    for (const acti_cod_acti of actividades) {
      const result = await client.query(
        `INSERT INTO dispensario.dmpost (
          post_cod_pacie,
          post_cod_medi, 
          post_cod_acti,
          post_cod_cita, 
          post_fec_post
        ) VALUES ($1, $2, $3, $4, $5)
        RETURNING post_cod_post, post_cod_acti`,  // Retornamos los datos insertados
        [
          pacienteId,
          medicoId, 
          acti_cod_acti,  // Aquí pasamos directamente el código de actividad
          citaId,
          fechaActual
        ]
      );
      actividadesRegistradas.push(result.rows[0]);
    }
    
    await client.query('COMMIT');
    return { 
      success: true, 
      message: `${actividades.length} actividades registradas correctamente`,
      data: actividadesRegistradas 
    };
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al registrar actividades:', error);
    throw new Error(`Error al registrar actividades: ${error.message}`);
  } finally {
    client.release();
  }
};



// Obtener médico por username
export const getMedicoByUsername = async (username) => {
  try {
    const query = `
      SELECT medic_cod_medic 
      FROM dispensario.dmmedic 
      WHERE medic_usu_medic = $1 
      LIMIT 1`;
    const { rows } = await db.query(query, [username]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error al obtener médico por username:', error);
    throw new Error('Error al obtener médico');
  }
};

// Obtener médico por su código (medic_cod_medic)
export const getMedicoByCodigo = async (codigoMedico) => {
  try {
    const query = `
      SELECT *
      FROM dispensario.dmmedic 
      WHERE medic_cod_medic = $1`;
    const { rows } = await db.query(query, [parseInt(codigoMedico)]);
    return rows[0] || null;
  } catch (error) {
    console.error('Error al obtener médico por código:', error);
    throw new Error('Error al obtener médico por código');
  }
};
// ... (todo el código existente se mantiene igual)

// ==============================================
// NUEVAS FUNCIONES PARA REPORTE DE ATENCIONES
// ==============================================

// ... (mantener todas las funciones existentes)

// Modificar las funciones de atenciones:

export const getAtenciones = async (filters = {}) => {
  const {
    fechaDesde,
    fechaHasta,
    medicoId,
    pacienteId,
    tipoActividad = 'POSTCONSULTA'
  } = filters;

  // Validar parámetros
  if (!tipoActividad) {
    throw new Error('El tipo de actividad es requerido');
  }

  let query = `
    SELECT 
      p.post_cod_post,
      p.post_cod_pacie,
      p.post_cod_medi,
      p.post_cod_acti,
      p.post_cod_cita,
      p.post_fec_post,
      a.acti_nom_acti,
      COALESCE(pac.pacie_nom_pacie, 'N/A') AS paciente_nombre,
      COALESCE(pac.pacie_ape_pacie, '') AS paciente_apellido,
      COALESCE(med.medic_nom_medic, 'N/A') AS medico_nombre,
      c.cita_fec_cita AS fecha_cita,
      c.cita_hor_cita AS hora_cita,
      COALESCE(esp.espe_nom_espe, 'N/A') AS especialidad,
      COALESCE(suc.disuc_nom_disuc, 'N/A') AS sucursal
    FROM 
      dispensario.dmpost p
    INNER JOIN 
      dispensario.dmacti a ON p.post_cod_acti = a.acti_cod_acti
    LEFT JOIN 
      dispensario.dmpacie pac ON p.post_cod_pacie = pac.pacie_cod_pacie
    LEFT JOIN 
      dispensario.dmmedic med ON p.post_cod_medi = med.medic_cod_medic
    LEFT JOIN
      dispensario.dmcita c ON p.post_cod_cita = c.cita_cod_cita
    LEFT JOIN
      dispensario.dmespec esp ON c.cita_cod_espe = esp.espe_cod_espe
    LEFT JOIN
      dispensario.dmdisuc suc ON c.cita_cod_sucu = suc.disuc_cod_disuc
    WHERE 
      a.acti_tip_acti = $1
  `;

  const values = [tipoActividad];
  let paramIndex = 2;

  // Filtros adicionales con validación
  if (fechaDesde) {
    query += ` AND p.post_fec_post >= $${paramIndex}`;
    values.push(fechaDesde);
    paramIndex++;
  }

  if (fechaHasta) {
    query += ` AND p.post_fec_post <= $${paramIndex}`;
    values.push(fechaHasta);
    paramIndex++;
  }

  if (medicoId) {
    query += ` AND p.post_cod_medi = $${paramIndex}`;
    values.push(medicoId);
    paramIndex++;
  }

  if (pacienteId) {
    query += ` AND p.post_cod_pacie = $${paramIndex}`;
    values.push(pacienteId);
    paramIndex++;
  }

  query += ` ORDER BY p.post_fec_post DESC, p.post_cod_post DESC`;

  try {
    const result = await db.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error en getAtenciones:', error);
    throw new Error(`Error al obtener atenciones: ${error.message}`);
  }
};

export const getEstadisticasAtenciones = async (filters = {}) => {
  const { fechaDesde, fechaHasta, medicoId } = filters;

  let query = `
    SELECT 
      COUNT(*) AS total_atenciones,
      COUNT(DISTINCT p.post_cod_pacie) AS pacientes_unicos,
      COUNT(DISTINCT p.post_cod_medi) AS medicos_involucrados,
      a.acti_nom_acti AS tipo_atencion,
      COALESCE(med.medic_nom_medic, 'N/A') AS medico_nombre
    FROM 
      dispensario.dmpost p
    INNER JOIN 
      dispensario.dmacti a ON p.post_cod_acti = a.acti_cod_acti
    LEFT JOIN 
      dispensario.dmmedic med ON p.post_cod_medi = med.medic_cod_medic
    WHERE 
      a.acti_tip_acti = $1
  `;

  const values = ['POSTCONSULTA'];
  let paramIndex = 2;

  // Filtros con validación
  if (fechaDesde) {
    query += ` AND p.post_fec_post >= $${paramIndex}`;
    values.push(fechaDesde);
    paramIndex++;
  }

  if (fechaHasta) {
    query += ` AND p.post_fec_post <= $${paramIndex}`;
    values.push(fechaHasta);
    paramIndex++;
  }

  if (medicoId) {
    query += ` AND p.post_cod_medi = $${paramIndex}`;
    values.push(medicoId);
    paramIndex++;
  }

  query += `
    GROUP BY a.acti_nom_acti, med.medic_nom_medic
    ORDER BY total_atenciones DESC
  `;

  try {
    const result = await db.query(query, values);
    return result.rows;
  } catch (error) {
    console.error('Error en getEstadisticasAtenciones:', error);
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }
};