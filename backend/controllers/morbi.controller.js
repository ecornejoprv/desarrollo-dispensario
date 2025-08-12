import { 
    getEstadisticasSistemas,
    getOpcionesSistemas 
  } from '../models/morbi.model.js';
  
  export const obtenerEstadisticasSistemas = async (req, res) => {
    try {
      const { sistema, fechaDesde, fechaHasta } = req.query;
      
      const resultados = await getEstadisticasSistemas(sistema, fechaDesde, fechaHasta);
      
      res.json({
        success: true,
        data: resultados,
        message: 'Reporte de sistemas generado correctamente'
      });
    } catch (error) {
      console.error('Error al generar reporte de sistemas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al generar el reporte',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };
  
  export const obtenerOpcionesSistemas = async (req, res) => {
    try {
      const sistemas = await getOpcionesSistemas();
      res.json(sistemas);
    } catch (error) {
      console.error('Error al obtener opciones de sistemas:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener sistemas disponibles',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  };