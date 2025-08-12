import { informixDb } from '../database/databaseInformix.js';

export class ProductosModel {
  static async buscarProductos({ empresa, sucursal, bodega, filtro }) {
    let connection;
    try {
      console.log('Ejecutando consulta de búsqueda de productos...');
      
      // Validar y formatear parámetros
      const bodegaParam = parseInt(bodega) || 0;
      const empresaParam = parseInt(empresa) || 0;
      const sucursalParam = parseInt(sucursal) || 0;
      
      // Limitar y normalizar el filtro
      const filtroParam = filtro ? filtro.toString().substring(0, 100).toUpperCase().trim() : '';
      
      // Dividir el filtro en tokens (palabras)
      const tokens = filtroParam.split(/\s+/).filter(token => token.length > 0);
      
      // Si no hay tokens válidos, retornar array vacío
      if (tokens.length === 0) {
        return [];
      }
  
      // Construir condiciones dinámicas para cada token
      const condiciones = tokens.map(token => 
        `(UPPER(saeprod.prod_nom_prod) LIKE '%${token}%' OR saeprod.prod_cod_prod LIKE '%${token}%')`
      ).join(' AND ');
  
      const query = `
        SELECT 
          saeprbo.prbo_cod_bode AS bodega,
          saeprbo.prbo_cod_prod AS codigo,
          saeprod.prod_cod_prod AS codigo_producto,
          saeunid.unid_sigl_unid AS siglas_unidad,
          saeunid.unid_cod_unid AS codigo_unidad,
          saeprbo.prbo_dis_prod AS disponible,
          saeprod.prod_nom_prod AS nombre,
          saeprod.prod_nom_ext AS nombre_extendido,
          saeprbo.prbo_cod_empr AS empresa,
          saeprbo.prbo_cod_sucu AS sucursal,
          saeprod.prod_des_prod AS descripcion
        FROM saeprod, saeprbo, saeunid
        WHERE saeprbo.prbo_cod_prod = saeprod.prod_cod_prod
          AND saeprod.prod_cod_sucu = saeprbo.prbo_cod_sucu
          AND saeprod.prod_cod_empr = saeprbo.prbo_cod_empr
          AND saeunid.unid_cod_unid = saeprbo.prbo_cod_unid
          AND saeunid.unid_cod_empr = saeprbo.prbo_cod_empr
          AND saeprbo.prbo_cod_bode = ?
          AND (${condiciones})
          AND saeprbo.prbo_cod_empr = ?
          AND saeprbo.prbo_cod_sucu = ?
          AND saeprbo.prbo_est_prod = '1'
        LIMIT 10
      `;
      
      const params = [bodegaParam, empresaParam, sucursalParam];
  
      console.log('Consulta SQL:', query);
      console.log('Parámetros de consulta:', params);
  
      connection = await informixDb.pool.connect();
      const result = await connection.query(query, params, { timeout: 60000 });
  
      // Mapear resultados
      const productos = result.map(row => ({
        bodega: parseInt(row.bodega) || 0,
        codigo: row.codigo?.toString().trim() || '',
        codigo_producto: row.codigo_producto?.toString().trim() || '',
        siglas_unidad: row.siglas_unidad?.toString().trim() || 'UN',
        codigo_unidad: parseInt(row.codigo_unidad) || 1,
        disponible: parseFloat(row.disponible) || 0,
        nombre: row.nombre?.toString().trim() || '',
        nombre_extendido: row.nombre_extendido?.toString().trim() || '',
        empresa: parseInt(row.empresa) || 0,
        sucursal: parseInt(row.sucursal) || 0,
        descripcion: row.descripcion?.toString().trim() || ''
      }));
  
      console.log(`Se encontraron ${productos.length} productos`);
      return productos;
  
    } catch (error) {
      console.error('Error en ProductosModel.buscarProductos:', {
        error: error.message,
        stack: error.stack
      });
      throw new Error(`Error al buscar productos: ${error.message}`);
    } finally {
      if (connection) {
        try {
          await connection.close();
        } catch (closeError) {
          console.error('Error al cerrar conexión:', closeError);
        }
      }
    }
  }
}