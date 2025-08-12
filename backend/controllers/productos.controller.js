import { ProductosModel } from '../models/productosModel.js';

export const buscarProductosController = async (req, res) => {
  const { bodega, empresa, sucursal, filtro } = req.query;

  // Validación mejorada de parámetros
  const errors = [];
  if (!bodega) errors.push('El parámetro bodega es requerido');
  if (!empresa) errors.push('El parámetro empresa es requerido');
  if (!sucursal) errors.push('El parámetro sucursal es requerido');
  if (!filtro) errors.push('El parámetro filtro es requerido');
  
  if (errors.length > 0) {
    return res.status(400).json({ 
      error: 'Parámetros incompletos',
      detalles: errors
    });
  }
  
    try {
    console.log('Iniciando búsqueda de productos con:', {
      bodega, empresa, sucursal, filtro: filtro.substring(0, 20) + (filtro.length > 20 ? '...' : '')
    });

    // Truncar el filtro a 100 caracteres
    const filtroTruncado = filtro.toString().substring(0, 100).toUpperCase();

    const resultados = await ProductosModel.buscarProductos({
      bodega: parseInt(bodega),
      empresa: parseInt(empresa),
      sucursal: parseInt(sucursal),
      filtro: filtro.toString()
    });

    res.status(200).json(resultados);
  } catch (error) {
    console.error('Error en buscarProductosController:', {
      error: error.message,
      params: { bodega, empresa, sucursal },
      stack: error.stack
    });

    const statusCode = error.message.includes('timeout') ? 504 : 500;
    res.status(statusCode).json({ 
      error: 'Error al buscar productos',
      mensaje: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
  }
};