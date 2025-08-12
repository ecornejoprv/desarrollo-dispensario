import { informixDb } from '../database/databaseInformix.js';

export const getDatosEmpleadoByCedula = async (cedula, empresa) => {
  let connection;
  try {
    // Validar parámetro
    if (!cedula || typeof cedula !== 'string') {
      throw new Error('Cédula inválida');
    }

    const query = `
      SELECT 
        codigo_empleado,
        nombre_empleado,
        nombre_departamento,
        nombre_seccion,
        nombre_cargo,
        fecha_ingreso
      FROM "informix".v_empleados_departamento
      WHERE codigo_empleado = ?
        AND codigo_empresa = ?
      LIMIT 1
    `;

    // Obtener conexión del pool
    connection = await informixDb.pool.connect();
    
    // Ejecutar consulta
    const result = await connection.query(query, [cedula.trim(), parseInt(empresa)]);


    if (result.length === 0) {
      return null;
    }

    return {
      cedula: result[0].codigo_empleado?.toString().trim() || '',
      nombre: result[0].nombre_empleado?.toString().trim() || '',
      departamento: result[0].nombre_departamento?.toString().trim() || '',
      seccion: result[0].nombre_seccion?.toString().trim() || '',
      cargo: result[0].nombre_cargo?.toString().trim() || '',
      fechaIngreso: result[0].fecha_ingreso ? new Date(result[0].fecha_ingreso).toISOString() : null
    };

  } catch (error) {
    console.error('Error en getDatosEmpleadoByCedula:', error);
    throw error;
  } finally {
    // Liberar conexión
    if (connection) {
      try {
        await connection.close();
      } catch (closeError) {
        console.error('Error al cerrar conexión:', closeError);
      }
    }
  }
};