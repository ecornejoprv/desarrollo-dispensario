import { informixDb } from '../database/databaseInformix.js';

export class ExistenciaCostosModel {
    static async execute({ an_cod_empr, an_cod_sucu, an_cod_bode, an_cod_linp, an_cod_grpr, an_cod_cate, an_cod_marc, ada_fec, as_cod_prod, as_cod_pro2 }) {
      const query = `EXECUTE PROCEDURE sp_r_existencia_dispensario(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      const params = [an_cod_empr, an_cod_sucu, an_cod_bode, an_cod_linp, an_cod_grpr, an_cod_cate, an_cod_marc, ada_fec, as_cod_prod, as_cod_pro2];
  
      try {
        console.log('Ejecutando procedimiento almacenado...');
        const result = await informixDb.query(query, params, { timeout: 60000 });
  
        // Depuración: Ver el resultado sin procesar
        console.log('Resultado sin procesar:', JSON.stringify(result, null, 2));
  
        // Mapear los resultados a un formato legible
        const mappedResults = result.map(row => ({
          codigo: row.codigo?.trim(),           // Código del producto
          bodega: row.bodega?.trim(),           // Nombre de la bodega
          disponible: parseFloat(row.disponible), // Cantidad disponible
          producto: row.producto?.trim(),       // Nombre del producto
          siglas: row.siglas?.trim(),           // Siglas de la unidad
          saldo: parseFloat(row.saldo),         // Saldo
          costo: parseFloat(row.costo),         // Costo
          stock_min: parseFloat(row.stock_min), // Stock mínimo
          stock_max: parseFloat(row.stock_max), // Stock máximo
          fecha_ultima_compra: row.fecha_ultima_compra, // Fecha de última compra
          precio_ultima_compra: parseFloat(row.precio_ultima_compra), // Precio de última compra
          fecha_ultima_transferencia: row.fecha_ultima_transferencia, // Fecha de última transferencia
          precio_ultima_transferencia: parseFloat(row.precio_ultima_transferencia), // Precio de última transferencia
          linea: row.linea?.trim(),             // Línea de producto
          grupo: row.grupo?.trim(),             // Grupo de producto
          categoria: row.categoria?.trim()      // Categoría de producto
        }));
  
        console.log('Procedimiento almacenado ejecutado correctamente:', mappedResults);
        return mappedResults;
      } catch (error) {
        console.error('Error en la ejecución del procedimiento almacenado:', error);
        throw new Error(`Error executing stored procedure: ${error.message}`);
      }
    }
  }