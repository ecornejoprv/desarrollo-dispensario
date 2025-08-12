import { obtenerDiagnosticosPorGenero, obtenerFiltrosReporte,obtenerTodosLosGeneros } from '../models/reportecie10.model.js';

export const mostrarReporteDiagnosticos = async (req, res) => {
    try {
        // Obtener el filtro de género si viene en query params (?genero=1)
        const { genero } = req.query;
        
        const diagnosticos = await obtenerDiagnosticosPorGenero(genero);
        const filtros = await obtenerFiltrosReporte();
        
        // Procesar los datos para la vista
        const reporte = {
            diagnosticos,
            total: diagnosticos.reduce((sum, item) => sum + item.cantidad, 0)
        };

        res.render('reportes/diagnosticosGenero', {
            title: 'Reporte de Diagnósticos por Género',
            reporte,
            filtros,
            generoSeleccionado: genero // Para mantener el filtro en la vista
        });
    } catch (error) {
        console.error('Error al generar el reporte:', error);
        res.status(500).render('error', {
            message: 'Error al generar el reporte',
            error
        });
    }
};

export const exportarReporteJSON = async (req, res) => {
    try {
        const { genero } = req.query;
        const diagnosticos = await obtenerDiagnosticosPorGenero(genero);
        
        res.json({
            success: true,
            data: {
                diagnosticos,
                total: diagnosticos.reduce((sum, item) => sum + item.cantidad, 0)
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al exportar el reporte',
            error: error.message
        });
    }
};
export const obtenerGeneros = async (req, res) => {
  try {
    const generos = await obtenerTodosLosGeneros();
    res.json({
      success: true,
      data: generos
    });
  } catch (error) {
    console.error('Error en controlador al obtener géneros:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener los géneros',
      error: error.message
    });
  }
};
// reportecie10.controller.js
export const obtenerDiagnosticosPorAreaGenero = async (req, res) => {
  try {
    const { genero, departamento } = req.query;
    
    // 1. Obtener empleados del área (si se especifica)
    let empleados = [];
    if (departamento) {
      empleados = await getAllEmpleados(departamento);
    }
    
    // 2. Construir consulta de diagnósticos
    let query = `
      SELECT 
        d.diag_cod_cie10,
        c.cie10_nom_cie10 AS nombre_diagnostico,
        COUNT(*) AS cantidad,
        STRING_AGG(d.diag_obs_diag, '; ') AS observaciones,
        g.idgen_nom_idgen AS genero
      FROM dispensario.dmdiag d
      JOIN dispensario.dmatenc a ON d.diag_cod_aten = a.aten_cod_aten
      JOIN dispensario.dmpacie p ON a.aten_cod_paci = p.pacie_cod_pacie
      JOIN dispensario.dmidgen g ON p.pacie_cod_gener = g.idgen_cod_idgen
      JOIN dispensario.dmcie10 c ON d.diag_cod_cie10 = c.cie10_cod_cie10
    `;
    
    const params = [];
    
    // Filtro por género
    if (genero) {
      query += ` WHERE p.pacie_cod_gener = $${params.length + 1}`;
      params.push(genero);
    }
    
    // Filtro por empleados del área (si aplica)
    if (departamento && empleados.length > 0) {
      const empleadosIds = empleados.map(e => e.cedula);
      query += `${genero ? ' AND' : ' WHERE'} a.aten_cod_medi IN ($${params.length + 1})`;
      params.push(empleadosIds);
    }
    
    query += `
      GROUP BY d.diag_cod_cie10, c.cie10_nom_cie10, g.idgen_nom_idgen
      ORDER BY cantidad DESC
      LIMIT 10
    `;
    
    const { rows } = await db.query(query, params);
    res.json({ success: true, data: rows });
    
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};