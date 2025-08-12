// ===================================================================================
// == Archivo Completo: backend/controllers/odontograma.controller.js ==
// ===================================================================================
// @summary ✅ MEJORA: Se reintroduce el controlador 'aplicarProtesisTotalArcadaController'.

import {
    actualizarOdontograma,
    obtenerOdontogramaCompleto,
    upsertDetalleDental,
    eliminarDetalleDental,
    setEstadoDienteCompleto,
    aplicarEstadoEnRango,
    obtenerDientes,
    obtenerEstadosDentales,
    obtenerSuperficiesDentales,
    listarOdontogramasPorPaciente,
    crearNuevoOdontograma,
    upsertPerioData,
    aplicarProtesisTotalArcada, // <-- REINTRODUCIDO
    eliminarProtesisCompleta,
    upsertIhosDetalle,
  } from '../models/odontograma.model.js';
  
  export const listarOdontogramasPorPacienteController = async (req, res, next) => {
    try {
        const { pacienteId } = req.params;
        const listaDeOdontogramas = await listarOdontogramasPorPaciente(pacienteId);
        res.status(200).json(listaDeOdontogramas);
    } catch (error) {
        next(error);
    }
  };
  
  export const obtenerOdontogramaPorIdController = async (req, res, next) => {
    try {
        const { odontogramaId } = req.params;
        const odontogramaCompleto = await obtenerOdontogramaCompleto(odontogramaId);
        if (!odontogramaCompleto) {
            return res.status(404).json({ message: 'La versión del odontograma especificada no fue encontrada.' });
        }
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.status(200).json(odontogramaCompleto);
    } catch (error) {
        next(error);
    }
  };
  
  export const crearNuevoOdontogramaController = async (req, res, next) => {
    try {
        const { pacienteId } = req.params;
        const nuevoOdontograma = await crearNuevoOdontograma(pacienteId);
        res.status(201).json(nuevoOdontograma);
    } catch (error) {
        next(error);
    }
  };
  
  export const upsertPerioDataController = async (req, res, next) => {
    try {
        const { odontogramaId, dienteId } = req.params;
        const { recesion, movilidad } = req.body;
        const perioData = await upsertPerioData({
            odontogramaId,
            dienteId,
            recesion,
            movilidad
        });
        res.status(200).json(perioData);
    } catch (error) {
        next(error);
    }
  };
  
  export const actualizarOdontogramaController = async (req, res, next) => {
    try {
        const { odontogramaId } = req.params;
        // ✅ Se añaden los nuevos campos a la desestructuración
        const { 
            odont_obs_odont,
            odont_periodonto,
            odont_maloclusion,
            odont_fluorosis,
            odont_cpo_c,
            odont_cpo_p,
            odont_cpo_o,
            odont_ceo_c,
            odont_ceo_e,
            odont_ceo_o
        } = req.body;
  
        // Construir el objeto de datos solo con los campos que vienen en la petición
        const updateData = {};
        if (odont_obs_odont !== undefined) updateData.odont_obs_odont = odont_obs_odont;
        if (odont_periodonto !== undefined) updateData.odont_periodonto = odont_periodonto;
        if (odont_maloclusion !== undefined) updateData.odont_maloclusion = odont_maloclusion;
        if (odont_fluorosis !== undefined) updateData.odont_fluorosis = odont_fluorosis;
        // ✅ Se añaden los nuevos campos al objeto de actualización
        if (odont_cpo_c !== undefined) updateData.odont_cpo_c = odont_cpo_c;
        if (odont_cpo_p !== undefined) updateData.odont_cpo_p = odont_cpo_p;
        if (odont_cpo_o !== undefined) updateData.odont_cpo_o = odont_cpo_o;
        if (odont_ceo_c !== undefined) updateData.odont_ceo_c = odont_ceo_c;
        if (odont_ceo_e !== undefined) updateData.odont_ceo_e = odont_ceo_e;
        if (odont_ceo_o !== undefined) updateData.odont_ceo_o = odont_ceo_o;
  
        const odontograma = await actualizarOdontograma(odontogramaId, updateData);
        res.status(200).json(odontograma);
    } catch (error) {
        next(error);
    }
  };
  
  export const upsertDetalleDentalController = async (req, res, next) => {
    try {
        const { odontogramaId } = req.params;
        const detalleData = req.body;
        const detalle = await upsertDetalleDental(odontogramaId, detalleData);
        res.status(201).json(detalle);
    } catch (error) {
        next(error);
    }
  };
  
  export const setEstadoDienteCompletoController = async (req, res, next) => {
    try {
        const { odontogramaId, dienteId } = req.params;
        const estadoData = req.body;
        if (!estadoData.estadoId) {
            return res.status(400).json({ message: 'El campo estadoId es requerido.' });
        }
        const detalleActualizado = await setEstadoDienteCompleto(odontogramaId, dienteId, estadoData);
        res.status(200).json(detalleActualizado);
    } catch (error) {
        next(error);
    }
  };
  
  export const eliminarDetalleDentalController = async (req, res, next) => {
    try {
        const { detalleId } = req.params;
        const resultado = await eliminarDetalleDental(detalleId);
        if (!resultado) {
            return res.status(404).json({ message: 'Detalle no encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        next(error);
    }
  };
  
  export const aplicarEstadoEnRangoController = async (req, res, next) => {
    try {
        const { odontogramaId } = req.params;
        const { dienteInicioId, dienteFinId, estadoId } = req.body;
        if (!dienteInicioId || !dienteFinId || !estadoId) {
            return res.status(400).json({ message: 'Los campos dienteInicioId, dienteFinId y estadoId son requeridos.' });
        }
        const detallesCreados = await aplicarEstadoEnRango({ odontogramaId, dienteInicioId, dienteFinId, estadoId });
        res.status(201).json(detallesCreados);
    } catch (error) {
        next(error);
    }
  };
  
  /**
  * @description ✅ CONTROLADOR REINTRODUCIDO: Maneja la lógica para aplicar una prótesis total a una arcada.
  */
  export const aplicarProtesisTotalArcadaController = async (req, res, next) => {
    try {
        const { odontogramaId } = req.params;
        const { dienteId, estadoId } = req.body;
        if (!dienteId || !estadoId) {
            return res.status(400).json({ message: 'Los campos dienteId y estadoId son requeridos.' });
        }
        const resultado = await aplicarProtesisTotalArcada({ odontogramaId, dienteId, estadoId });
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
  };
  
  export const eliminarProtesisCompletaController = async (req, res, next) => {
    try {
        const { odontogramaId, dienteId } = req.params;
        const resultado = await eliminarProtesisCompleta({ odontogramaId, dienteId });
        res.status(200).json(resultado);
    } catch (error) {
        next(error);
    }
  };
  
  export const guardarIhosController = async (req, res, next) => {
    try {
        const { odontogramaId } = req.params;
        const detallesIhos = req.body;
  
        if (!Array.isArray(detallesIhos)) {
            return res.status(400).json({ message: 'El cuerpo de la petición debe ser un array de detalles.' });
        }
        
        const resultado = await upsertIhosDetalle({ odontogramaId, detallesIhos });
        res.status(201).json(resultado);
    } catch (error) {
        next(error);
    }
  };
  
  export const obtenerDientesController = async (req, res, next) => {
    try {
        const dientes = await obtenerDientes();
        res.status(200).json(dientes);
    } catch (error) {
        next(error);
    }
  };
  
  export const obtenerEstadosDentalesController = async (req, res, next) => {
    try {
        const estados = await obtenerEstadosDentales();
        res.status(200).json(estados);
    } catch (error) {
        next(error);
    }
  };
  
  export const obtenerSuperficiesDentalesController = async (req, res, next) => {
    try {
        const superficies = await obtenerSuperficiesDentales();
        res.status(200).json(superficies);
    } catch (error) {
        next(error);
    }
  };