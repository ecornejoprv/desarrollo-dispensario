import { ProductosModel } from '../models/productosModel.js';

// Buscar productos
export const buscarProductosController = async (req, res) => {
  const { bodega, empresa, sucursal, filtro } = req.query;

  // Validar parámetros requeridos
  if (!bodega, !empresa || !sucursal || !filtro) {
    return res.status(400).json({ error: "Los parámetros bodega, empresa, sucursal y filtro son requeridos." });
  }

  try {
    // Llamar al modelo para buscar productos
    const resultados = await ProductosModel.buscarProductos({ bodega, empresa, sucursal, filtro });

    // Devolver los resultados en formato JSON
    res.status(200).json(resultados);
  } catch (error) {
    // Manejar errores
    console.error('Error en el controlador de búsqueda de productos:', error);
    res.status(500).json({ error: "Error al buscar productos: " + error.message });
  }
};