import { db } from '../database/databasePostgres.js'; // Importa la conexión a PostgreSQL

// Obtener todas las citas
export const getCitas = async () => {
  const query = 'SELECT * FROM dispensario.dmcita';
  const result = await db.query(query);
  return result.rows;
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