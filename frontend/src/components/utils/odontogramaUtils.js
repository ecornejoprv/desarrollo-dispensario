// ===================================================================================
// == Archivo Modificado y Completo: utils/odontogramaUtils.js ==
// ===================================================================================
// @summary ✅ MEJORA: 'getProsthesisInfo' ahora incluye el 'tipo' ('fija' o 'removible')
//          en la información que devuelve, para poder diferenciar su tratamiento.

/**
 * @description Determina si un estado dental se aplica a toda la pieza ('tooth') o a una superficie ('surface').
 */
export const getEstadoMetadata = (nombreEstado) => {
    const toothLevelStates = [
        'Extracción indicada', 'Pérdida por caries', 'Pérdida otra causa necesaria',
        'Pérdida otra causa realizada', 'Endodoncia necesaria', 'Endodoncia realizada',
        'Corona necesaria', 'Corona realizada', 'Prótesis fija necesaria',
        'Prótesis fija realizada', 'Prótesis removible necesaria', 'Prótesis removible realizada',
        'Prótesis total necesaria', 'Prótesis total realizada', 'Implante necesario', 'Implante realizado'
    ];
    if (toothLevelStates.includes(nombreEstado)) {
        return 'tooth';
    }
    return 'surface';
  };
  
  /**
  * @description Determina si un estado es de tipo protésico de rango.
  */
  export const isProstheticState = (nombreEstado) => {
    const prostheticStates = [
        'Prótesis fija necesaria', 'Prótesis fija realizada',
        'Prótesis removible necesaria', 'Prótesis removible realizada',
        'Prótesis total necesaria', 'Prótesis total realizada'
    ];
    return prostheticStates.includes(nombreEstado);
  };
  
  export const getProstheticType = (nombreEstado) => {
    if (nombreEstado.includes('Prótesis fija')) return 'fija';
    if (nombreEstado.includes('Prótesis removible')) return 'removible';
    if (nombreEstado.includes('Prótesis total')) return 'total';
    return null;
  };
  
  /**
  * @description Procesa los detalles para identificar rangos de prótesis y los roles de cada diente.
  * @param {Array} detalles - La lista de detalles del odontograma.
  * @returns {Object} Un mapa donde la clave es el ID del diente y el valor es su rol, posición y tipo.
  */
  export const getProsthesisInfo = (detalles) => {
    const prosthesisInfo = {};
    if (!detalles || detalles.length === 0) {
        return prosthesisInfo;
    }
  
    // 1. Filtrar solo los detalles que son parte de un grupo de prótesis.
    const groupedProsthesisDetails = detalles.filter(d => d.grupoId);
  
    if (groupedProsthesisDetails.length === 0) {
        return prosthesisInfo;
    }
  
    // 2. Agrupar los detalles por su 'grupoId'.
    const rangesByGroup = groupedProsthesisDetails.reduce((acc, detail) => {
        const groupId = detail.grupoId;
        if (!acc[groupId]) {
            acc[groupId] = [];
        }
        acc[groupId].push(detail);
        return acc;
    }, {});
  
    // 3. Procesar cada grupo para asignar roles de pilar y póntico.
    for (const groupId in rangesByGroup) {
        const range = rangesByGroup[groupId];
        if (range.length === 0) continue;
  
        // Ordenar el rango por el número de diente
        range.sort((a, b) => parseInt(a.dienteId, 10) - parseInt(b.dienteId, 10));
  
        const prostheticType = getProstheticType(range[0].estado);
        
        if (range.length > 1) {
            const startTooth = range[0];
            const endTooth = range[range.length - 1];
            
            prosthesisInfo[startTooth.dienteId] = { role: 'pilar', position: 'inicio', type: prostheticType };
            prosthesisInfo[endTooth.dienteId] = { role: 'pilar', position: 'fin', type: prostheticType };
  
            for (let i = 1; i < range.length - 1; i++) {
                prosthesisInfo[range[i].dienteId] = { role: 'pontico', type: prostheticType };
            }
        } else if (range.length === 1) {
            prosthesisInfo[range[0].dienteId] = { role: 'pontico', type: prostheticType };
        }
    }
  
    return prosthesisInfo;
  };