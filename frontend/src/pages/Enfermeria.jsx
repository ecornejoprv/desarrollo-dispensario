// src/pages/Enfermeria.jsx (Código Final - Contenedor con Pestañas)
// ==============================================================================
// @summary: Este componente ahora actúa como un contenedor principal para el
//           módulo de enfermería. Renderiza una interfaz de pestañas que permite
//           al usuario cambiar entre la vista de 'Citas Pendientes' y la de
//           'Actividades Generales'.
// ==============================================================================

import React, { useState } from 'react';
import styles from './styles/enfermeria.module.css';

// Importamos los dos nuevos componentes que representan cada pestaña.
import CitasPendientes from '../components/CitasPendientes';
import ActividadesGenerales from '../components/ActividadesGenerales';

const Enfermeria = () => {
  // Estado para controlar qué pestaña está activa. Por defecto, 'citas'.
  const [activeTab, setActiveTab] = useState('citas');

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Módulo de Enfermería</h1>

      {/* Contenedor de los botones de las pestañas */}
      <div className={styles['tabs-container']}>
        <button
          className={`${styles['tab-button']} ${activeTab === 'citas' ? styles['tab-button-active'] : ''}`}
          onClick={() => setActiveTab('citas')}
        >
          Citas Pendientes
        </button>
        <button
          className={`${styles['tab-button']} ${activeTab === 'actividades' ? styles['tab-button-active'] : ''}`}
          onClick={() => setActiveTab('actividades')}
        >
          Actividades Generales
        </button>
      </div>

      {/* Contenido que se muestra según la pestaña activa */}
      <div className={styles['tab-content']}>
        {activeTab === 'citas' && <CitasPendientes />}
        {activeTab === 'actividades' && <ActividadesGenerales />}
      </div>
    </div>
  );
};

export default Enfermeria;