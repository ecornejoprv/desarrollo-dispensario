import { informixDb } from '../database/databaseInformix.js';

export class ProductosModel {
    static async buscarProductos({ empresa, sucursal, bodega, filtro }) {
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
        --AND saeprod.prod_cod_prod like 'ME%'
        AND (saeprod.prod_nom_prod LIKE ? OR saeprod.prod_cod_prod LIKE ?)
        AND saeprbo.prbo_cod_empr = ?
        AND saeprbo.prbo_cod_sucu = ?
        AND saeprbo.prbo_est_prod = '1'
      LIMIT 10;  -- Limitar a 10 resultados
    `;
  
      const params = [bodega, `%${filtro.toUpperCase()}%`, `%${filtro.toUpperCase()}%`, empresa, sucursal];
  
      try {
        console.log('Ejecutando consulta de búsqueda de productos...');
        const result = await informixDb.query(query, params);
  
        // Mapear los resultados a un formato legible
        const productos = result.map(row => ({
          bodega: row.bodega,
          codigo: row.codigo?.trim(),
          codigo_producto: row.codigo_producto?.trim(),
          siglas_unidad: row.siglas_unidad?.trim(),
          codigo_unidad: row.codigo_unidad,
          disponible: parseFloat(row.disponible),
          nombre: row.nombre?.trim(),
          nombre_extendido: row.nombre_extendido?.trim(),
          empresa: row.empresa,
          sucursal: row.sucursal,
          descripcion: row.descripcion?.trim()
        }));
  
        console.log('Consulta ejecutada correctamente:', productos);
        return productos;
      } catch (error) {
        console.error('Error en la consulta de búsqueda de productos:', error);
        throw new Error(`Error searching products: ${error.message}`);
      }
    }
  }