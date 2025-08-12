import { getEstadisticasPrevencion } from '../models/prevencion.model.js';
import { getTop10DiagnosticosCombinados, obtenerTodosLosGeneros } from '../controllers/reporteCombinado.controller.js';

export const getReportePrevencion = async (req, res) => {
  try {
    const { genero, departamento } = req.query;
    
    const datos = await getEstadisticasPrevencion(genero, departamento);
    //const areas = await getAllAreas();
    const generos = await obtenerTodosLosGeneros();

    res.json({
      success: true,
      data: {
        estadisticas: datos,
        total: datos.reduce((sum, item) => sum + parseInt(item.total), 0),
        filtros: { generos }
      }
    });

  } catch (error) {
    console.error('Error en getReportePrevencion:', error);
    res.status(500).json({
      success: false,
      message: 'Error al generar reporte de prevención',
      error: error.message
    });
  }
};