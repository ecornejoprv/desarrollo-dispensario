// src/hooks/useDebounce.js
import { useState, useEffect } from 'react';

export function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // Actualiza el valor después del 'delay'
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Limpia el temporizador si el valor cambia (o el componente se desmonta)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // Solo se re-ejecuta si 'value' o 'delay' cambian

  return debouncedValue;
}