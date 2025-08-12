// ==============================================================================
// @summary: Este componente renderiza la lista de citas pendientes. Se ha
//           refactorizado para usar una tabla HTML semántica (<table>) en lugar
//           de divs. Esto garantiza una alineación de columnas perfecta y mejora
//           la accesibilidad y estructura del código.
// ==============================================================================

// --- 1. IMPORTACIONES ---
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import styles from '../pages/styles/enfermeria.module.css'; 
import { useAuth } from './context/AuthContext';

// --- 2. DEFINICIÓN DEL COMPONENTE ---
const CitasPendientes = () => {
    // --- HOOKS ---
    const navigate = useNavigate();
    const { activeLocation } = useAuth();

    // --- ESTADOS ---
    const [citas, setCitas] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [nombresMedicos, setNombresMedicos] = useState({});

    // --- EFECTO PRINCIPAL ---
    useEffect(() => {
        if (!activeLocation) {
            setLoading(false);
            setCitas([]);
            return;
        };

        const fetchCitas = async () => {
            setLoading(true);
            setError(null);
            try {
                const { data: citasData } = await api.get("/api/v1/citas/citas-atendidas", {
                    params: { locationId: activeLocation }
                });

                const codigosMedicosUnicos = [...new Set(citasData.map(c => c.cita_cod_medi).filter(Boolean))];
                const nombresMedicosTemp = {};

                for (const codigo of codigosMedicosUnicos) {
                    try {
                        const { data: response } = await api.get(`/api/v1/citas/medicos/${codigo}`);
                        if (response.success && response.data) {
                           nombresMedicosTemp[codigo] = response.data.medic_nom_medic;
                        }
                    } catch (error) {
                        console.error(`Error obteniendo médico ${codigo}:`, error);
                        nombresMedicosTemp[codigo] = "Médico no disponible";
                    }
                }
                setNombresMedicos(nombresMedicosTemp);
                
                const citasConPacientes = await Promise.all(
                    citasData.map(async (cita) => {
                        if (cita.cita_cod_pacie) {
                            const paciente = await fetchPacienteById(cita.cita_cod_pacie);
                            return { ...cita, paciente };
                        }
                        return cita;
                    })
                );
                setCitas(citasConPacientes);
            } catch (err) {
                console.error("Error al obtener citas en CitasPendientes:", err);
                setError("No se pudieron cargar las citas para esta ubicación.");
            } finally {
                setLoading(false);
            }
        };
        fetchCitas();
    }, [activeLocation]);

    // --- FUNCIONES AUXILIARES ---
    const fetchPacienteById = async (id) => {
        try {
            const { data } = await api.get(`/api/v1/pacientes/${id}`);
            return data;
        } catch (error) {
            console.error(`Error al obtener paciente ${id}:`, error);
            return null;
        }
    };
    
    const handleRegistrarAtencion = async (cita) => {
        try {
            const paciente = cita.paciente || await fetchPacienteById(cita.cita_cod_pacie);
            const nombreMedico = nombresMedicos[cita.cita_cod_medi] || "No disponible";
            const citaCompleta = { 
                ...cita, 
                paciente, 
                medico: { 
                    medic_cod_medic: cita.cita_cod_medi, 
                    medic_nom_medic: nombreMedico 
                }
            };
            navigate("/atencita", { state: { cita: citaCompleta, mode: 'postconsulta' } });
        } catch (error) {
            console.error("Error al preparar datos para la atención:", error);
            alert('Error al cargar los datos completos de la cita.');
        }
    };

    const formatFecha = (fecha) => {
        if (!fecha) return 'N/A';
        return new Date(fecha).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    // --- RENDERIZADO DEL COMPONENTE ---
    if (loading) return <p>Cargando citas pendientes para la ubicación seleccionada...</p>;
    if (error) return <p style={{ color: 'red' }}>{error}</p>;

    return (
        <div>
            {citas.length === 0 ? (
                <p>No hay citas pendientes para esta ubicación.</p>
            ) : (
                <div className={styles['citas-table-container']}>
                    <table className={styles['citas-table']}>
                        <thead>
                            <tr>
                                <th className={styles['col-fecha']}>Fecha</th>
                                <th className={styles['col-hora']}>Hora</th>
                                <th className={styles['col-paciente']}>Paciente</th>
                                <th className={styles['col-medico']}>Médico</th>
                                <th className={styles['col-creado']}>Creado por</th>
                                <th className={styles['col-acciones']}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.map((cita) => (
                                <tr key={cita.cita_cod_cita}>
                                    <td className={styles['col-fecha']}>{formatFecha(cita.cita_fec_cita)}</td>
                                    <td className={styles['col-hora']}>{cita.cita_hor_cita?.slice(0, 5) || ''}</td>
                                    <td className={styles['col-paciente']}>
                                        <span className={styles["cita-icon"]}>{cita.cita_est_cita === 'AT' ? '✅' : '⏳'}</span>
                                        {cita.paciente ? `${cita.paciente.pacie_ape_pacie} ${cita.paciente.pacie_nom_pacie}` : "Cargando..."}
                                    </td>
                                    <td className={styles['col-medico']}>{nombresMedicos[cita.cita_cod_medi] || "N/A"}</td>
                                    <td className={styles['col-creado']}>{cita.creado_por_usuario || "N/A"}</td>
                                    <td className={styles['col-acciones']}>
                                        <button className={styles["registrar-button"]} onClick={() => handleRegistrarAtencion(cita)}>
                                            Gestionar Atención
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default CitasPendientes;