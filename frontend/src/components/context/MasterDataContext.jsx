// src/components/context/MasterDataContext.jsx (Código Simplificado)
// ==============================================================================
// @summary: Este contexto se ha simplificado. Ya NO carga los datos del
//           odontograma. Ahora sirve como un contenedor para futuros datos
//           maestros que sí necesiten ser globales en toda la aplicación.
// ==============================================================================

import React, { createContext, useContext } from 'react';

// 1. Creamos el contexto. El valor inicial es null.
const MasterDataContext = createContext(null);

// 2. Creamos el "Proveedor" del contexto.
//    Por ahora, no carga ningún dato, simplemente pasa un objeto vacío.
export const MasterDataProvider = ({ children }) => {
  // El valor puede estar vacío o contener otros datos maestros en el futuro.
  const value = {}; 

  return (
    <MasterDataContext.Provider value={value}>
      {children}
    </MasterDataContext.Provider>
  );
};

// 3. Creamos un "custom hook" para consumir el contexto.
export const useMasterData = () => {
  const context = useContext(MasterDataContext);
  if (context === undefined) {
    throw new Error('useMasterData debe ser usado dentro de un MasterDataProvider');
  }
  return context;
};