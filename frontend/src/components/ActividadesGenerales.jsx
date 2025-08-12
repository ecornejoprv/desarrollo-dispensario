// src/components/enfermeria/ActividadesGenerales.jsx (Código Completo)
// ==============================================================================
// @summary: Este componente renderiza la interfaz para registrar actividades
//           generales de enfermería. Incluye un buscador de pacientes, una lista
//           de actividades, y el módulo de gestión de anticonceptivos.
// ==============================================================================

import React, { useState, useEffect } from 'react';
import api from '../api';
import styles from '../pages/styles/enfermeria.module.css';
import AnticonceptivosComponent from './anticonceptivos';
import Modal from 'react-modal';

Modal.setAppElement('#root');

const ActividadesGenerales = () => {
    // --- ESTADOS ---
    const [actividadesAdmin, setActividadesAdmin] = useState([]);
    const [selectedActivities, setSelectedActivities] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [searchLoading, setSearchLoading] = useState(false);
    const [observaciones, setObservaciones] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [isAnticonceptivosOpen, setIsAnticonceptivosOpen] = useState(false);

    // --- EFECTOS ---
    useEffect(() => {
        const fetchActividadesAdmin = async () => {
            setLoading(true);
            try {
                const { data } = await api.get("/api/v1/citas/tiposactividades?tipo=POSTCONSULTA");
                const actividadesData = data.data || [];
                setActividadesAdmin(actividadesData);
                const initialSelection = {};
                actividadesData.forEach(act => { initialSelection[act.acti_cod_acti] = false; });
                setSelectedActivities(initialSelection);
            } catch (err) {
                setError("Error al cargar la lista de actividades");
            } finally {
                setLoading(false);
            }
        };
        fetchActividadesAdmin();
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (searchTerm.trim() && !selectedPatient) { searchPatients(); } else { setSearchResults([]); }
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm, selectedPatient]);

    // --- FUNCIONES ---
    const searchPatients = async () => {
        setSearchLoading(true);
        try {
            const { data } = await api.get(`/api/v1/pacientes?search=${searchTerm}`);
            setSearchResults(data.pacientes || []);
        } catch (error) {
            setSearchResults([]);
        } finally {
            setSearchLoading(false);
        }
    };
    
    const guardarActividades = async () => {
        try {
            if (!selectedPatient) throw new Error("Debe seleccionar un paciente");
            const especialistaId = localStorage.getItem("especialista");
            if (!especialistaId) throw new Error("No se encontró información del especialista.");

            const actividadesSeleccionadas = Object.keys(selectedActivities).filter(key => selectedActivities[key]).map(key => parseInt(key));
            if (actividadesSeleccionadas.length === 0) throw new Error("Debe seleccionar al menos una actividad");
            
            setIsSaving(true);
            const response = await api.post("/api/v1/citas/actividades/registrar", {
                actividades: actividadesSeleccionadas,
                medicoId: parseInt(especialistaId),
                pacienteId: selectedPatient.pacie_cod_pacie,
                observaciones: observaciones
            });
            if (response.data.success) {
                alert(response.data.message || "Actividades registradas correctamente");
                handleCancel();
            } else {
                throw new Error(response.data.error || "Error al registrar actividades");
            }
        } catch (error) {
            alert(error.message || "Error al guardar las actividades");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setSelectedPatient(null);
        setSearchTerm("");
        setObservaciones("");
        const initialSelection = {};
        actividadesAdmin.forEach(act => { initialSelection[act.acti_cod_acti] = false; });
        setSelectedActivities(initialSelection);
    };

    const handleCheckboxChange = (id) => {
        setSelectedActivities(prev => ({...prev, [id]: !prev[id]}));
    };

    const handlePatientSelection = (paciente) => {
        setSelectedPatient(paciente);
        setSearchResults([]);
        setSearchTerm(`${paciente.pacie_ape_pacie} ${paciente.pacie_nom_pacie}`);
    };

    const openAnticonceptivosModal = () => setIsAnticonceptivosOpen(true);
    const closeAnticonceptivosModal = () => setIsAnticonceptivosOpen(false);

    // --- RENDERIZADO ---
    return (
        <div className={styles['activities-container']}>
            <div className={styles["patient-search-section"]}>
                <h4>Buscar Paciente</h4>
                <div className={styles["paciente-input-wrapper"]}>
                    <input type="text" placeholder="Buscar por cédula o apellidos..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={styles["search-input"]} disabled={!!selectedPatient} />
                </div>
                {searchLoading && <p>Buscando...</p>}
                {searchResults.length > 0 && <ul className={styles["search-results"]}>{searchResults.map((p) => <li key={p.pacie_cod_pacie} className={styles["patient-result"]} onClick={() => handlePatientSelection(p)}>{p.pacie_ced_pacie} - {p.pacie_ape_pacie} {p.pacie_nom_pacie}</li>)}</ul>}
                {selectedPatient && <div className={styles["selected-patient"]}><strong>Paciente Seleccionado:</strong> {selectedPatient.pacie_ape_pacie} {selectedPatient.pacie_nom_pacie}</div>}
            </div>
            {selectedPatient && <div style={{ marginBottom: '2rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}><button className={styles['anticonceptivos-button']} onClick={openAnticonceptivosModal}>Gestión de Métodos Anticonceptivos</button></div>}
            {loading ? <p>Cargando actividades...</p> : error ? <p style={{ color: 'red' }}>{error}</p> : (
                <>
                    {selectedPatient && (
                        <>
                            <div className={styles["checkbox-grid"]}>{actividadesAdmin.map(a => <label key={a.acti_cod_acti} className={styles["checkbox-label"]}><input type="checkbox" checked={selectedActivities[a.acti_cod_acti] || false} onChange={() => handleCheckboxChange(a.acti_cod_acti)} />{a.acti_nom_acti}</label>)}</div>
                            <div className={styles["observations-container"]}><label>Observaciones:</label><textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Ingrese observaciones adicionales..." rows={4} /></div>
                            <div className={styles["actions-container"]}><button className={styles["cancel-button"]} type="button" onClick={handleCancel}>Limpiar / Nuevo</button><button className={styles["save-button"]} onClick={guardarActividades} disabled={!selectedPatient || isSaving}>{isSaving ? 'Guardando...' : 'Guardar Actividades'}</button></div>
                        </>
                    )}
                </>
            )}
            {selectedPatient && <Modal isOpen={isAnticonceptivosOpen} onRequestClose={closeAnticonceptivosModal} contentLabel="Gestión de Métodos Anticonceptivos" style={{ content: { top: '50%', left: '50%', right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)', width: '90%', maxWidth: '1000px', maxHeight: '90vh', padding: '1.5rem', overflowY: 'auto' }, overlay: { backgroundColor: 'rgba(0, 0, 0, 0.6)', zIndex: 1001 } }}><AnticonceptivosComponent pacienteId={Number(selectedPatient.pacie_cod_pacie)} /><button onClick={closeAnticonceptivosModal} style={{ marginTop: '1.5rem', float: 'right', padding: '10px 20px', cursor: 'pointer' }}>Cerrar</button></Modal>}
        </div>
    );
};

export default ActividadesGenerales;