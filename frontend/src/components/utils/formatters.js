// frontend/src/components/utils/formatters.js

/**
 * Formatea una fecha a "dd/mm/yyyy".
 * Incluye validación para evitar errores con fechas inválidas.
 * @param {string | Date} dateString La fecha a formatear.
 * @returns {string} La fecha formateada, "Fecha inválida" en caso de error, o un string vacío.
 */
export const formatDateDDMMYYYY = (dateString) => {
    // Paso 1: Imprimir en consola para saber qué valor está llegando.
    // ¡Esto es clave para la depuración!
    //console.log('Valor recibido en el formateador:', dateString);
  
    // Paso 2: Si el valor es nulo o indefinido, retornar un string vacío.
    if (!dateString) {
      return '';
    }
  
    // Paso 3: Crear el objeto Date a partir del string.
    const date = new Date(dateString);
  
    // Paso 4: ¡La validación más importante!
    // Si `new Date()` falla, crea un objeto "Invalid Date".
    // `getTime()` en una fecha inválida devuelve NaN. `isNaN()` lo detecta.
    if (isNaN(date.getTime())) {
      //console.error('Error: El valor no se pudo convertir a una fecha válida:', dateString);
      return 'Fecha inválida'; // Devolvemos un texto descriptivo del error.
    }
  
    // Paso 5: Si la fecha es válida, la formateamos.
    // Usamos los métodos UTC para evitar problemas con la zona horaria del navegador.
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0'); // getUTCMonth es base 0
    const year = date.getUTCFullYear();
  
    return `${day}/${month}/${year}`;
  };