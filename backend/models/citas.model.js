import { db } from '../database/databasePostgres.js';

// Obtener todas las citas
export const getCitas = async (userCompanies = [], locationId = null) => {
    // --- CAMBIO CLAVE: Se añade un LEFT JOIN a la tabla de usuarios ---
    let query = `
        SELECT 
            c.*, 
            p.pacie_cod_empr, 
            e.empr_nom_empr,
            (SELECT espe_nom_espe FROM dispensario.dmespec WHERE espe_cod_espe = c.cita_cod_espe) AS especialidad_nombre,
            (SELECT disuc_nom_disuc FROM dispensario.dmdisuc WHERE disuc_cod_disuc = c.cita_cod_sucu) AS sucursal_nombre,
            creador.usua_nombre_completo AS creado_por_usuario -- Ahora seleccionamos el nombre completo
        FROM dispensario.dmcita c
        JOIN dispensario.dmpacie p ON c.cita_cod_pacie = p.pacie_cod_pacie
        JOIN dispensario.dmempr e ON p.pacie_cod_empr = e.empr_cod_empr
        LEFT JOIN dispensario.usuarios creador ON c.cita_creado_por_usua = creador.usua_cod_usua
        WHERE c.cita_est_cita = 'PE' -- <<< CAMBIO CLAVE: Se filtra por estado 'PE' (Pendiente)
    `;

    const params = [];
    let paramIndex = 1;

    if (userCompanies && userCompanies.length > 0) {
        query += ` AND p.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
        params.push(userCompanies);
        paramIndex++;
    } else {
        query += ` AND FALSE`;
    }

    if (locationId) {
        query += ` AND c.cita_cod_sucu = $${paramIndex}`;
        params.push(locationId);
        paramIndex++;
    }

    query += ` ORDER BY c.cita_fec_cita DESC, c.cita_hor_cita DESC;`;

    try {
        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        throw new Error(`Error al obtener citas: ${error.message}`);
    }
};

export const getCitasAtendidas = async (userCompanies = [], locationId = null) => {
    // La consulta es casi idéntica a getCitas, pero con un filtro diferente.
    let query = `
        SELECT 
            c.*, 
            p.pacie_cod_empr, 
            e.empr_nom_empr,
            (SELECT espe_nom_espe FROM dispensario.dmespec WHERE espe_cod_espe = c.cita_cod_espe) AS especialidad_nombre,
            (SELECT disuc_nom_disuc FROM dispensario.dmdisuc WHERE disuc_cod_disuc = c.cita_cod_sucu) AS sucursal_nombre,
            creador.usua_nombre_completo AS creado_por_usuario
        FROM dispensario.dmcita c
        JOIN dispensario.dmpacie p ON c.cita_cod_pacie = p.pacie_cod_pacie
        JOIN dispensario.dmempr e ON p.pacie_cod_empr = e.empr_cod_empr
        LEFT JOIN dispensario.usuarios creador ON c.cita_creado_por_usua = creador.usua_cod_usua
        WHERE c.cita_est_cita = 'AT' AND c.cita_cod_espe = 1 -- <<< CAMBIO CLAVE: Se filtra por estado 'AT'. y que sean de especialidad 1 (Medicina General)
    `;

    // El resto de la lógica de filtrado por empresa y sucursal es la misma.
    const params = [];
    let paramIndex = 1;

    if (userCompanies && userCompanies.length > 0) {
        query += ` AND p.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
        params.push(userCompanies);
        paramIndex++;
    } else {
        query += ` AND FALSE`;
    }

    if (locationId) {
        query += ` AND c.cita_cod_sucu = $${paramIndex}`;
        params.push(locationId);
        paramIndex++;
    }

    // Se ordena por fecha y hora para ver las más recientes primero.
    query += ` ORDER BY c.cita_fec_cita DESC, c.cita_hor_cita DESC;`;

    try {
        const result = await db.query(query, params);
        return result.rows;
    } catch (error) {
        throw new Error(`Error al obtener citas atendidas: ${error.message}`);
    }
};

// Actualizar solo el estado de una cita
export const updateEstadoCita = async (cita_cod_cita, estado, userCompanies = []) => {
    // Primero, obtener la cita para verificar la empresa del paciente (se usa getCitaById para esto)
    const citaExistente = await getCitaById(cita_cod_cita, userCompanies); // getCitaById ya aplica el filtro
    if (!citaExistente) {
        throw new Error('Cita no encontrada o no tiene permisos para modificarla.');
    }

    const query = `UPDATE dispensario.dmcita
SET cita_est_cita = $1
WHERE cita_cod_cita = $2
RETURNING *;`;

    try {
        const result = await db.query(query, [estado, cita_cod_cita]);
        return result.rows[0];
    } catch (error) {
        console.error('Error al actualizar estado de cita:', error.message);
        throw new Error(`Error al actualizar estado de cita: ${error.message}`);
    }
};

// Obtener una cita por su ID
export const getCitaById = async (cita_cod_cita, userCompanies = []) => { // Recibe userCompanies
    // Importante: Eliminar cualquier espacio o salto de línea al inicio de la cadena
    let query = `SELECT c.*, p.pacie_cod_empr, e.empr_nom_empr,
    (SELECT espe_nom_espe FROM dispensario.dmespec WHERE espe_cod_espe = c.cita_cod_espe) AS especialidad_nombre,
    (SELECT disuc_nom_disuc FROM dispensario.dmdisuc WHERE disuc_cod_disuc = c.cita_cod_sucu) AS sucursal_nombre
FROM dispensario.dmcita c
JOIN dispensario.dmpacie p ON c.cita_cod_pacie = p.pacie_cod_pacie
JOIN dispensario.dmempr e ON p.pacie_cod_empr = e.empr_cod_empr
WHERE c.cita_cod_cita = $1`;

    const params = [cita_cod_cita];
    let paramIndex = 2;

    if (userCompanies && userCompanies.length > 0) {
        query += ` AND p.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
        params.push(userCompanies);
    } else {
        console.warn("DEBUG MODEL (getCitaById): userCompanies está vacío o nulo. Devolviendo null.");
        return null;
    }

    console.log("--- DEBUG getCitaById Model ---");
    console.log("Query de texto:", query);
    console.log("Parámetros:", params);
    console.log("--- FIN DEBUG getCitaById Model ---");

    try {
        const result = await db.query(query, params);
        return result.rows[0];
    } catch (error) {
        console.error('Error al obtener la cita por ID en model:', error.message);
        throw new Error(`Error al obtener la cita por ID: ${error.message}`);
    }
};

// Verificar disponibilidad de la cita
export const isCitaDisponible = async (cita, userCompanies = []) => { // Recibe userCompanies
    const {
        cita_cod_sucu,
        cita_cod_espe,
        cita_hor_cita,
        cita_fec_cita,
        cita_cod_medi,
        cita_cod_pacie,
        cita_cod_cita = null,
    } = cita;

    const pacienteResult = await db.query(`SELECT pacie_cod_empr FROM dispensario.dmpacie WHERE pacie_cod_pacie = $1`, [cita_cod_pacie]);
    if (!pacienteResult.rows[0]) {
        throw new Error("Paciente no encontrado para la cita.");
    }
    const pacienteEmpresa = pacienteResult.rows[0].pacie_cod_empr;

    if (!userCompanies.includes(pacienteEmpresa)) {
        console.warn(`DEBUG MODEL (isCitaDisponible): Intento de agendar para empresa no autorizada: ${pacienteEmpresa} por usuario con acceso a ${userCompanies}`);
        throw new Error("No tiene permiso para agendar citas para pacientes de esta empresa.");
    }

    let query = `SELECT EXISTS (
SELECT 1 FROM dispensario.dmcita
WHERE cita_cod_sucu = $1
  AND cita_cod_espe = $2
  AND cita_hor_cita = $3
  AND cita_fec_cita = $4
  AND cita_cod_medi = $5
  ${cita_cod_cita ? 'AND cita_cod_cita <> $6' : ''}
) AS disponible;`;

    const values = cita_cod_cita
        ? [cita_cod_sucu, cita_cod_espe, cita_hor_cita, cita_fec_cita, cita_cod_medi, cita_cod_cita]
        : [cita_cod_sucu, cita_cod_espe, cita_hor_cita, cita_fec_cita, cita_cod_medi];

    try {
        const result = await db.query(query, values);
        return !result.rows[0].disponible;
    } catch (error) {
        console.error('Error al verificar disponibilidad de la cita:', error.message);
        throw new Error(`Error al verificar disponibilidad: ${error.message}`);
    }
};

// Crear una nueva cita
export const createCita = async (cita, userCompanies = [], creatorUserId) => {
    // La validación de disponibilidad no cambia.
    if (!(await isCitaDisponible(cita, userCompanies))) {
        throw new Error('La cita no está disponible en este horario.');
    }

    const {
        cita_cod_pacie,
        cita_cod_sucu,
        cita_cod_espe,
        cita_hor_cita,
        cita_fec_cita,
        cita_cod_medi,
    } = cita;

    // --- CAMBIO CLAVE: Se añade la nueva columna al INSERT ---
    const query = `INSERT INTO dispensario.dmcita (
        cita_cod_pacie, cita_cod_sucu, cita_cod_espe,
        cita_hor_cita, cita_fec_cita, cita_cod_medi,
        cita_creado_por_usua -- Nueva columna
    ) VALUES ($1, $2, $3, $4, $5, $6, $7) -- Nuevo valor
    RETURNING *;`;

    try {
        const result = await db.query(query, [
            cita_cod_pacie,
            cita_cod_sucu,
            cita_cod_espe,
            cita_hor_cita,
            cita_fec_cita,
            cita_cod_medi,
            creatorUserId, // Se añade el ID del creador al array de valores.
        ]);
        return result.rows[0];
    } catch (error) {
        console.error('Error al crear la cita:', error.message);
        throw new Error(`Error al guardar la cita: ${error.message}`);
    }
};

// Actualizar una cita existente
export const updateCita = async (cita_cod_cita, cita, userCompanies = []) => { // Recibe userCompanies
    const citaExistente = await getCitaById(cita_cod_cita, userCompanies);
    if (!citaExistente) {
        throw new Error('Cita no encontrada o no tiene permisos para modificarla.');
    }

    const disponible = await isCitaDisponible({ ...cita, cita_cod_cita }, userCompanies);

    if (!disponible) {
        throw new Error('La cita no está disponible en este horario.');
    }

    const query = `UPDATE dispensario.dmcita
SET cita_cod_pacie = $1, cita_cod_sucu = $2, cita_cod_espe = $3,
    cita_hor_cita = $4, cita_fec_cita = $5, cita_cod_medi = $6
WHERE cita_cod_cita = $7
RETURNING *;`;

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
        console.error('Error al actualizar la cita:', error.message);
        throw new Error(`Error al actualizar la cita: ${error.message}`);
    }
};

// Eliminar una cita (marcar como 'CA' - Cancelada)
export const deleteCita = async (cita_cod_cita, userCompanies = []) => { // Recibe userCompanies
    const citaExistente = await getCitaById(cita_cod_cita, userCompanies);
    if (!citaExistente) {
        throw new Error('Cita no encontrada o no tiene permisos para cancelarla.');
    }

    const query = `UPDATE dispensario.dmcita SET cita_est_cita = 'CA' WHERE cita_cod_cita = $1 RETURNING *`;
    try {
        const result = await db.query(query, [cita_cod_cita]);
        return result.rows[0];
    } catch (error) {
        console.error('Error al eliminar la cita:', error.message);
        throw new Error(`Error al eliminar la cita: ${error.message}`);
    }
};

// Obtener todas las especialidades (datos maestros)
export const getAllEspecialidades = async () => {
    const query = `SELECT espe_cod_espe, espe_nom_espe FROM dispensario.dmespec`;
    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error al obtener especialidades:', error.message);
        throw new Error('Error al obtener especialidades');
    }
};

// Obtener todos los lugares de atención (datos maestros)
export const getAllLugaresAtencion = async (userCompanies = []) => {
    // Si el usuario no tiene empresas asignadas, devuelve un array vacío.
    if (!userCompanies || userCompanies.length === 0) {
        return [];
    }

    // Consulta que une los lugares de atención con la nueva tabla de relación
    // y filtra para devolver solo los lugares que corresponden a las empresas del usuario.
    const query = {
        text: `
            SELECT DISTINCT d.disuc_cod_disuc, d.disuc_nom_disuc
            FROM dispensario.dmdisuc d
            JOIN dispensario.empresa_disuc ed ON d.disuc_cod_disuc = ed.disuc_cod_disuc
            WHERE ed.empr_cod_empr = ANY($1::integer[])
            ORDER BY d.disuc_nom_disuc;
        `,
        values: [userCompanies] // El array de empresas se pasa como parámetro seguro.
    };

    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error al obtener lugares de atención filtrados:', error.message);
        throw new Error('Error al obtener lugares de atención');
    }
};

// Obtener todas las especialidades por sucursal
export const getEspecialidadesPorSucursal = async (disucId) => {
    const query = `SELECT se.espe_cod_espe, e.espe_nom_espe
FROM dispensario.disuc_especialidad se
JOIN dispensario.dmespec e ON se.espe_cod_espe = e.espe_cod_espe
WHERE se.disuc_cod_disuc = $1
ORDER BY e.espe_nom_espe ASC;`;
    try {
        const { rows } = await db.query(query, [disucId]);
        return rows;
    }
    catch (error) {
        console.error('Error al obtener especialidades por sucursal:', error.message);
        throw new Error('Error al obtener especialidades por sucursal');
    }
};

// Obtener todos los médicos activos (datos maestros)
export const getAllMedicos = async () => {
    const query = `SELECT medic_cod_medic, medic_nom_medic
FROM dispensario.dmmedic
WHERE medic_est_medic = 'AC'`;
    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error al obtener médicos:', error.message);
        throw new Error('Error al obtener médicos');
    }
};

// Obtener médicos por especialidad (datos maestros)
export const getMedicosPorEspecialidad = async (especialidadId, sucursalId) => {
    const query = {
        text: `
            SELECT m.medic_cod_medic, m.medic_nom_medic
            FROM dispensario.dmmedic m
            -- Unimos con nuestra nueva tabla para filtrar por lugar de atención
            JOIN dispensario.medico_disuc md ON m.medic_cod_medic = md.medic_cod_medic
            WHERE m.medic_cod_espe = $1      -- Filtra por especialidad
              AND md.disuc_cod_disuc = $2  -- Filtra por lugar de atención
              AND m.medic_est_medic = 'AC'; -- Solo médicos activos
        `,
        values: [especialidadId, sucursalId]
    };
    try {
        const { rows } = await db.query(query);
        return rows;
    } catch (error) {
        console.error('Error al obtener médicos por especialidad y sucursal:', error.message);
        throw new Error('Error al obtener médicos por especialidad');
    }
};

// Obtener actividades por tipo
export const getActividadesByTipo = async (tipos) => {
    try {
        const tiposArray = Array.isArray(tipos) ? tipos : [tipos];
        const placeholders = tiposArray.map((_, index) => `$${index + 1}`).join(',');

        const query = `SELECT * FROM dispensario.dmacti
WHERE acti_tip_acti IN (${placeholders})
ORDER BY acti_nom_acti ASC`;

        const { rows } = await db.query(query, tiposArray);
        return rows;
    } catch (error) {
        console.error('Error al obtener actividades:', error.message);
        throw new Error('Error al obtener actividades');
    }
};

// Registrar actividades en postconsulta
export const registrarActividadesPost = async (medicoId, actividades, citaId = null, pacienteId = null, observaciones = '', userCompanies = []) => {
  // Se inicia la conexión a la base de datos para poder usar transacciones.
  const client = await db.connect();
  try {
    // Se inicia una transacción. Si algo falla, se revierte todo.
    await client.query('BEGIN');

    // Se realizan las validaciones de permisos para asegurar que el usuario puede actuar sobre el paciente.
    if (pacienteId) {
      const pacienteResult = await client.query(`SELECT pacie_cod_empr FROM dispensario.dmpacie WHERE pacie_cod_pacie = $1`, [pacienteId]);
      if (!pacienteResult.rows[0] || !userCompanies.includes(pacienteResult.rows[0].pacie_cod_empr)) {
        throw new Error("No tiene permiso para registrar actividades para este paciente o el paciente no existe.");
      }
    }
    if (citaId) {
      const cita = await getCitaById(citaId, userCompanies);
      if (!cita) {
        throw new Error("No tiene permiso para registrar actividades para esta cita o la cita no existe.");
      }
    }

    // --- CORRECCIÓN CLAVE ---
    // Se elimina la generación de la fecha en JavaScript que causaba el problema de zona horaria.
    // const fechaActual = new Date().toISOString(); // <-- LÍNEA ELIMINADA

    // Se prepara la consulta SQL para insertar en la tabla dmpost.
    const query = `
      INSERT INTO dispensario.dmpost (
        post_cod_pacie,
        post_cod_medi,
        post_cod_acti,
        post_cod_cita,
        post_fec_post,      -- Esta columna ahora será manejada por PostgreSQL
        post_obs_post
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5) -- Se usa la función CURRENT_TIMESTAMP de SQL.
      RETURNING post_cod_post, post_cod_acti
    `;

    // Se valida que 'actividades' sea un array.
    if (!Array.isArray(actividades)) {
      throw new Error('El parámetro actividades debe ser un array');
    }

    // Se itera sobre cada actividad seleccionada para realizar la inserción en la base de datos.
    const actividadesRegistradas = [];
    for (const acti_cod_acti of actividades) {
      // Se definen los valores para los parámetros de la consulta.
      // Nótese que la fecha ya no se pasa aquí, pues la maneja directamente la base de datos.
      const values = [
        pacienteId,
        medicoId,
        acti_cod_acti,
        citaId,
        observaciones || null
      ];

      // Se ejecuta la consulta de inserción. PostgreSQL se encargará de poner la fecha y hora correctas.
      const result = await client.query(query, values);
      actividadesRegistradas.push(result.rows[0]);
    }

    // Si todas las inserciones fueron exitosas, se confirma la transacción.
    await client.query('COMMIT');
    
    // Se devuelve una respuesta de éxito.
    return {
      success: true,
      message: `${actividades.length} actividades registradas correctamente`,
      data: actividadesRegistradas
    };
  } catch (error) {
    // Si ocurre cualquier error durante el proceso, se revierte la transacción.
    await client.query('ROLLBACK');
    console.error('Error al registrar actividades:', error.message);
    // Se lanza el error para que el controlador lo capture.
    throw new Error(`Error al registrar actividades: ${error.message}`);
  } finally {
    // Se libera la conexión con la base de datos, sin importar si hubo éxito o error.
    client.release();
  }
};

// Obtener médico por username (datos maestros)
export const getMedicoByUsername = async (username) => {
    const query = `SELECT medic_cod_medic
FROM dispensario.dmmedic
WHERE medic_usu_medic = $1
LIMIT 1`;
    try {
        const { rows } = await db.query(query, [username]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener médico por username:', error.message);
        throw new Error('Error al obtener médico');
    }
};

// Obtener médico por su código (datos maestros)
export const getMedicoByCodigo = async (codigoMedico) => {
    const query = `SELECT *
FROM dispensario.dmmedic
WHERE medic_cod_medic = $1`;
    try {
        const { rows } = await db.query(query, [parseInt(codigoMedico)]);
        return rows[0] || null;
    } catch (error) {
        console.error('Error al obtener médico por código:', error.message);
        throw new Error('Error al obtener médico por código');
    }
};

// ==============================================
// FUNCIONES PARA REPORTE DE ATENCIONES (dmpost)
// ==============================================

// Modificada: Ahora filtra atenciones (dmpost) por la empresa del paciente asociado
export const getAtenciones = async (filters = {}, userCompanies = []) => {
    const {
        fechaDesde,
        fechaHasta,
        medicoId,
        pacienteId,
        tipoActividad = 'POSTCONSULTA'
    } = filters;

    if (!tipoActividad) {
        throw new Error('El tipo de actividad es requerido');
    }

    let query = `SELECT
    p.post_cod_post,
    p.post_cod_pacie,
    p.post_cod_medi,
    p.post_cod_acti,
    p.post_cod_cita,
    p.post_fec_post,
    p.post_obs_post, -- Asegurarse de seleccionar la nueva columna
    a.acti_nom_acti,
    COALESCE(pac.pacie_nom_pacie, 'N/A') AS paciente_nombre,
    COALESCE(pac.pacie_ape_pacie, '') AS paciente_apellido,
    COALESCE(med.medic_nom_medic, 'N/A') AS medico_nombre,
    c.cita_fec_cita AS fecha_cita,
    c.cita_hor_cita AS hora_cita,
    COALESCE(esp.espe_nom_espe, 'N/A') AS especialidad,
    COALESCE(suc.disuc_nom_disuc, 'N/A') AS sucursal,
    pac.pacie_cod_empr, -- Añadimos el código de empresa del paciente
    empr.empr_nom_empr -- Añadimos el nombre de la empresa del paciente
FROM
    dispensario.dmpost p
INNER JOIN
    dispensario.dmacti a ON p.post_cod_acti = a.acti_cod_acti
LEFT JOIN
    dispensario.dmpacie pac ON p.post_cod_pacie = pac.pacie_cod_pacie
LEFT JOIN
    dispensario.dmempr empr ON pac.pacie_cod_empr = empr.empr_cod_empr -- Unir para el filtro de empresa
LEFT JOIN
    dispensario.dmmedic med ON p.post_cod_medi = med.medic_cod_medic
LEFT JOIN
    dispensario.dmcita c ON p.post_cod_cita = c.cita_cod_cita
LEFT JOIN
    dispensario.dmespec esp ON c.cita_cod_espe = esp.espe_cod_espe
LEFT JOIN
    dispensario.dmdisuc suc ON c.cita_cod_sucu = suc.disuc_cod_sucu
LEFT JOIN
    dispensario.dmdisp disp ON suc.disuc_cod_disp = disp.disp_cod_disp
WHERE
    a.acti_tip_acti = $1`;

    const values = [tipoActividad];
    let paramIndex = 2;

    if (fechaDesde) {
        query += ` AND p.post_fec_post >= $${paramIndex}::date`;
        values.push(fechaDesde);
        paramIndex++;
    }
    if (fechaHasta) {
        query += ` AND p.post_fec_post <= $${paramIndex}::date`;
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

    if (userCompanies && userCompanies.length > 0) {
        query += ` AND pac.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
        values.push(userCompanies);
        paramIndex++;
    } else {
        console.warn("DEBUG MODEL (getAtenciones/dmpost): userCompanies está vacío o nulo. No se devolverán resultados.");
        query += ` AND FALSE`;
    }

    query += ` ORDER BY p.post_fec_post DESC, p.post_cod_post DESC`;

    console.log("--- DEBUG getAtenciones (dmpost) Model ---");
    console.log("Query de texto:", query);
    console.log("Parámetros:", values);
    console.log("--- FIN DEBUG getAtenciones (dmpost) Model ---");

    try {
        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error en getAtenciones (dmpost):', error.message);
        throw new Error(`Error al obtener atenciones: ${error.message}`);
    }
};

export const getEstadisticasAtenciones = async (filters = {}, userCompanies = []) => {
    const { fechaDesde, fechaHasta, medicoId } = filters;

    let query = `SELECT
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
LEFT JOIN
    dispensario.dmpacie pac ON p.post_cod_pacie = pac.pacie_cod_pacie -- Unir para el filtro de empresa
WHERE
    a.acti_tip_acti = $1`;

    const values = ['POSTCONSULTA'];
    let paramIndex = 2;

    if (fechaDesde) {
        query += ` AND p.post_fec_post >= $${paramIndex}::date`;
        values.push(fechaDesde);
        paramIndex++;
    }
    if (fechaHasta) {
        query += ` AND p.post_fec_post <= $${paramIndex}::date`;
        values.push(fechaHasta);
        paramIndex++;
    }
    if (medicoId) {
        query += ` AND p.post_cod_medi = $${paramIndex}`;
        values.push(medicoId);
        paramIndex++;
    }

    if (userCompanies && userCompanies.length > 0) {
        query += ` AND pac.pacie_cod_empr = ANY($${paramIndex}::integer[])`;
        values.push(userCompanies);
        paramIndex++;
    } else {
        console.warn("DEBUG MODEL (getEstadisticasAtenciones): userCompanies está vacío o nulo. No se devolverán resultados.");
        query += ` AND FALSE`;
    }

    query += ` GROUP BY a.acti_nom_acti, med.medic_nom_medic
ORDER BY total_atenciones DESC`;

    console.log("--- DEBUG getEstadisticasAtenciones (dmpost) Model ---");
    console.log("Query de texto:", query);
    console.log("Parámetros:", values);
    console.log("--- FIN DEBUG getEstadisticasAtenciones (dmpost) Model ---");

    try {
        const result = await db.query(query, values);
        return result.rows;
    } catch (error) {
        console.error('Error en getEstadisticasAtenciones (dmpost):', error.message);
        throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }
};

export const getEnfermeriaStaff = async (userCompanies = []) => {
  let query = `
    SELECT m.medic_cod_medic, m.medic_nom_medic
    FROM dispensario.dmmedic m
    JOIN dispensario.dmespec e ON m.medic_cod_espe = e.espe_cod_espe
    WHERE e.espe_nom_espe = 'Enfermeria' AND m.medic_est_medic = 'AC'
  `;

  // Este filtro es opcional, pero es una buena práctica si el personal de enfermería
  // también está asignado a empresas específicas. Si no es el caso, puedes eliminarlo.
  const params = [];
  let paramIndex = 1;
  if (userCompanies && userCompanies.length > 0) {
    // Asumiendo que existe una tabla de relación medico-empresa
    // Si no, esta parte se puede ajustar o eliminar.
    // Por ahora, asumimos que todos los enfermeros son visibles si tienes acceso a alguna empresa.
  }

  query += ` ORDER BY m.medic_nom_medic ASC;`;

  try {
    const { rows } = await db.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error al obtener personal de enfermería:', error.message);
    throw new Error('Error al obtener personal de enfermería');
  }
};