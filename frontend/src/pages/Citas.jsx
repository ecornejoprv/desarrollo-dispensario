// ==============================================================================
// @summary: Componente para la gestión completa de citas. Permite buscar pacientes,
//           agendar nuevas citas y ver las existentes. La lista de citas se filtra
//           por la ubicación de trabajo activa y el buscador de pacientes tiene
//           la estructura JSX corregida para evitar la superposición de elementos.
//           La tabla de citas ahora utiliza <table> para una alineación perfecta.
// ==============================================================================

// --- 1. IMPORTACIONES ---
import React, { useState, useEffect } from "react";
import api from "../api";
import styles from "./styles/citas.module.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../components/context/AuthContext';

// --- 2. DEFINICIÓN DEL COMPONENTE ---
const Citas = () => {
    // --- HOOKS Y CONTEXTO ---
    const navigate = useNavigate();
    const { activeLocation } = useAuth();

    // --- ESTADOS DEL COMPONENTE ---
    const [citas, setCitas] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [searchPaciente, setSearchPaciente] = useState("");
    const [formData, setFormData] = useState({
        cita_cod_pacie: "",
        cita_cod_sucu: "",
        cita_cod_espe: "",
        cita_hor_cita: "",
        cita_fec_cita: "",
        cita_cod_medi: "",
    });
    const [editingCita, setEditingCita] = useState(null);
    const [lugaresAtencion, setLugaresAtencion] = useState([]);
    const [especialidadesPorSucursal, setEspecialidadesPorSucursal] = useState([]);
    const [medicos, setMedicos] = useState([]);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [selectedPaciente, setSelectedPaciente] = useState(null);

    // --- EFECTOS (useEffect) ---

    // Se ejecuta cuando la ubicación activa cambia para recargar la lista de citas.
    useEffect(() => {
        if (activeLocation) {
            fetchCitas();
        }
        fetchLugaresAtencion();
    }, [activeLocation]);

    // Se ejecuta para buscar pacientes mientras el usuario escribe.
    useEffect(() => {
        if (searchPaciente.length >= 2 && !selectedPaciente) {
            fetchPacientes();
        } else if (searchPaciente.length < 2 && !selectedPaciente) {
            setPacientes([]);
        }
    }, [searchPaciente, selectedPaciente]);

    // Gestiona la desaparición de los mensajes de éxito.
    useEffect(() => {
        if (successMessage) {
            const timer = setTimeout(() => { setSuccessMessage(""); }, 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessage]);

    // Se ejecuta al seleccionar un "Lugar de Atención" para cargar las especialidades.
    useEffect(() => {
        if (formData.cita_cod_sucu) {
            fetchEspecialidadesPorSucursal(formData.cita_cod_sucu);
            setFormData(prevData => ({ ...prevData, cita_cod_espe: "", cita_cod_medi: "" }));
            setMedicos([]);
        } else {
            setEspecialidadesPorSucursal([]);
            setMedicos([]);
            setFormData(prevData => ({ ...prevData, cita_cod_espe: "", cita_cod_medi: "" }));
        }
    }, [formData.cita_cod_sucu]);

    // Se ejecuta cuando se selecciona un Lugar de Atención O una Especialidad para cargar los médicos.
    useEffect(() => {
        if (formData.cita_cod_sucu && formData.cita_cod_espe) {
            fetchMedicosPorSucursalYEspecialidad(formData.cita_cod_sucu, formData.cita_cod_espe);
        } else {
            setMedicos([]);
        }
    }, [formData.cita_cod_sucu, formData.cita_cod_espe]);

    // --- FUNCIONES ASÍNCRONAS (Llamadas a la API) ---

    // Navega a la página de atención ('Atencita') en modo 'triaje'.
    const handleIrATriaje = (cita) => {
        const citaCompleta = { ...cita };
        navigate('/atencita', { state: { cita: citaCompleta, mode: 'triaje' } });
    };

    // Obtiene los datos de un paciente por su ID.
    const fetchPacienteById = async (pacienteId) => {
        try {
            const { data } = await api.get(`/api/v1/pacientes/${pacienteId}`);
            return data;
        } catch (error) {
            console.error("Error al obtener paciente por ID:", error);
            return null;
        }
    };

    // Obtiene la lista de citas filtrada por la ubicación activa.
    const fetchCitas = async () => {
        try {
            const { data: citasData } = await api.get("/api/v1/citas", {
                params: { locationId: activeLocation }
            });
            const citasCompletas = await Promise.all(
                citasData.map(async (cita) => {
                    let pacienteData = { pacie_nom_pacie: "No disponible", pacie_ape_pacie: "" };
                    let medicoData = { medic_nom_medic: "No disponible" };
                    if (cita.cita_cod_pacie) {
                         const pacienteRes = await api.get(`/api/v1/pacientes/${cita.cita_cod_pacie}`);
                         if (pacienteRes.data) pacienteData = pacienteRes.data;
                    }
                    if (cita.cita_cod_medi) {
                        const medicoRes = await api.get(`/api/v1/citas/medicos/${cita.cita_cod_medi}`);
                        if(medicoRes.data.success) medicoData = medicoRes.data.data;
                    }
                    return { ...cita, paciente: pacienteData, medico: medicoData };
                })
            );
            setCitas(citasCompletas);
        } catch (error) {
            console.error("Error al obtener citas:", error);
            setError("Error al cargar las citas");
        }
    };

    // Obtiene los lugares de atención filtrados por el contexto de trabajo.
    const fetchLugaresAtencion = async () => {
        try {
            const { data } = await api.get("/api/v1/citas/lugares-atencion");
            setLugaresAtencion(data.data);
        } catch (error) {
            console.error("Error fetching lugares de atención:", error);
            setError("Error al cargar los lugares de atención.");
        }
    };

    // Obtiene las especialidades disponibles para un lugar de atención específico.
    const fetchEspecialidadesPorSucursal = async (sucursalId) => {
        try {
            const { data } = await api.get(`/api/v1/citas/lugares-atencion/${sucursalId}/especialidades`);
            setEspecialidadesPorSucursal(data.data);
        } catch (error) {
            console.error("Error fetching especialidades por sucursal:", error);
            setError("Error al cargar las especialidades para esta sucursal.");
        }
    };

    // Obtiene los médicos activos para una especialidad y lugar de atención específicos.
    const fetchMedicosPorSucursalYEspecialidad = async (sucursalId, especialidadId) => {
        try {
            const { data } = await api.get(`/api/v1/citas/lugares-atencion/${sucursalId}/especialidades/${especialidadId}/medicos`);
            const medicosData = data.data || [];
            setMedicos(medicosData);
            if (medicosData.length === 1) {
                setFormData((prevData) => ({ ...prevData, cita_cod_medi: medicosData[0].medic_cod_medic }));
            } else {
                setFormData((prevData) => ({ ...prevData, cita_cod_medi: "" }));
            }
        } catch (error) {
            console.error("Error fetching médicos por especialidad y sucursal:", error);
            setError("Error al cargar los médicos.");
            setMedicos([]);
        }
    };

    // Busca pacientes. El backend filtra por el contexto activo.
    const fetchPacientes = async () => {
        try {
            const { data } = await api.get("/api/v1/pacientes", { params: { search: searchPaciente } });
            setPacientes(data.pacientes);
        } catch (error) {
            console.error("Error fetching pacientes en frontend:", error);
            setError(error.response?.data?.message || "Error al buscar pacientes.");
        }
    };

    // --- FUNCIONES Y MANEJADORES DE EVENTOS ---

    // Formatea la fecha a un formato legible.
    const formatFecha = (fecha) => {
        const date = new Date(fecha);
        return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    };

    // Maneja los cambios en los inputs del formulario.
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // Maneja la selección de un paciente de la lista de búsqueda.
    const handleSelectPaciente = (paciente) => {
        setFormData({ ...formData, cita_cod_pacie: paciente.pacie_cod_pacie });
        setSelectedPaciente(paciente);
        setSearchPaciente(`${paciente.pacie_ape_pacie} ${paciente.pacie_nom_pacie}`);
        setPacientes([]);
    };

    // Limpia la selección del paciente.
    const clearPacienteSelection = () => {
        setFormData({ ...formData, cita_cod_pacie: "" });
        setSelectedPaciente(null);
        setSearchPaciente("");
    };

    // Maneja el envío del formulario para crear o actualizar una cita.
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.cita_cod_pacie || !formData.cita_cod_sucu || !formData.cita_cod_espe || !formData.cita_cod_medi) {
            setError("Por favor, complete todos los campos obligatorios.");
            return;
        }
        setIsSubmitting(true);
        setError("");
        setSuccessMessage("");
        try {
            const now = new Date();
            const citaData = {
                ...formData,
                cita_fec_cita: now.toISOString().split('T')[0],
                cita_hor_cita: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`
            };
            if (editingCita) {
                await api.put(`/api/v1/citas/${editingCita.cita_cod_cita}`, citaData);
                setSuccessMessage("¡Cita actualizada exitosamente!");
            } else {
                await api.post("/api/v1/citas", citaData);
                setSuccessMessage("¡Cita creada exitosamente!");
            }
            fetchCitas();
            setFormData({ cita_cod_pacie: "", cita_cod_sucu: "", cita_cod_espe: "", cita_hor_cita: "", cita_fec_cita: "", cita_cod_medi: "" });
            setEditingCita(null);
            clearPacienteSelection();
        } catch (error) {
            setError(error.response?.data?.message || "Ocurrió un error al guardar la cita.");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Prepara el formulario para editar una cita existente.
    const handleEdit = async (cita) => {
        setFormData({
            cita_cod_pacie: cita.cita_cod_pacie, cita_cod_sucu: cita.cita_cod_sucu,
            cita_cod_espe: cita.cita_cod_espe, cita_hor_cita: cita.cita_hor_cita,
            cita_fec_cita: cita.cita_fec_cita, cita_cod_medi: cita.cita_cod_medi,
        });
        setEditingCita(cita);
        setError("");
        setSuccessMessage("");
        if (cita.cita_cod_pacie) {
            const paciente = await fetchPacienteById(cita.cita_cod_pacie);
            if (paciente) {
                setSelectedPaciente(paciente);
                setSearchPaciente(`${paciente.pacie_ape_pacie} ${paciente.pacie_nom_pacie}`);
            }
        }
    };

    // Maneja la cancelación de una cita.
    const handleDelete = async (cita_cod_cita) => {
        if (!window.confirm("¿Estás seguro de que deseas cancelar esta cita?")) return;
        try {
            await api.delete(`/api/v1/citas/${cita_cod_cita}`);
            fetchCitas();
            setSuccessMessage("¡Cita cancelada exitosamente!");
        } catch (error) {
            setError(error.response?.data?.message || "Error al cancelar la cita.");
        }
    };

    // --- 3. RENDERIZADO DEL COMPONENTE ---
    return (
        <div className={styles["citas-container"]}>
            <h1 className={styles["citas-title"]}>Agendamiento de Citas</h1>
            <form onSubmit={handleSubmit} className={styles["citas-form"]}>
                <h2 className={styles["citas-subtitle"]}>{editingCita ? "Editar Cita" : "Crear Nueva Cita"}</h2>
                {error && <p className={styles["citas-error"]}>{error}</p>}
                {successMessage && <div className={styles["citas-success"]}>{successMessage}</div>}
                <div className={styles["citas-form-grid"]}>
                    <div className={`${styles["citas-form-group"]}`} style={{ gridColumn: '1 / -1' }}>
                        <label className={styles["citas-label"]}>Paciente:</label>
                        <div className={styles["citas-paciente-input-wrapper"]}>
                            <input className={styles["citas-input"]} type="text" placeholder="Buscar por cédula, nombre o apellido..." value={searchPaciente} onChange={(e) => { setSearchPaciente(e.target.value); if (selectedPaciente) { clearPacienteSelection(); } }} />
                            {selectedPaciente && (<button type="button" className={styles["citas-clear-btn"]} onClick={clearPacienteSelection}>×</button>)}
                            {pacientes.length > 0 && !selectedPaciente && ( 
                                <ul className={styles["citas-pacientes-list"]}>
                                    {pacientes.map((paciente) => (
                                        <li key={paciente.pacie_cod_pacie} className={styles["citas-pacientes-item"]} onClick={() => handleSelectPaciente(paciente)}>
                                            <div style={{ fontWeight: "bold" }}>{paciente.pacie_ape_pacie} {paciente.pacie_nom_pacie}</div>
                                            <div style={{ color: "#666", fontSize: "14px" }}>Cédula: {paciente.pacie_ced_pacie} {paciente.empr_nom_empr && `(Empresa: ${paciente.empr_nom_empr})`}</div>
                                        </li>
                                    ))}
                                </ul> 
                            )}
                        </div>
                        {selectedPaciente && (<div className={styles["citas-paciente-info"]}><div><strong>Paciente seleccionado:</strong></div><div>{selectedPaciente.pacie_ape_pacie} {selectedPaciente.pacie_nom_pacie}</div><div style={{ color: "#555", fontSize: "14px" }}>Cédula: {selectedPaciente.pacie_ced_pacie}</div></div>)}
                    </div>
                    <div className={styles["citas-form-group"]}><label className={styles["citas-label"]}>Lugar de Atención:</label><select className={styles["citas-select"]} name="cita_cod_sucu" value={formData.cita_cod_sucu} onChange={handleInputChange} required><option value="">Seleccione un lugar</option>{lugaresAtencion.map((lugar) => (<option key={lugar.disuc_cod_disuc} value={lugar.disuc_cod_disuc}>{lugar.disuc_nom_disuc}</option>))}</select></div>
                    <div className={styles["citas-form-group"]}><label className={styles["citas-label"]}>Especialidad:</label><select className={styles["citas-select"]} name="cita_cod_espe" value={formData.cita_cod_espe} onChange={handleInputChange} required disabled={!formData.cita_cod_sucu || especialidadesPorSucursal.length === 0}><option value="">Seleccione una especialidad</option>{especialidadesPorSucursal.map((especialidad) => (<option key={especialidad.espe_cod_espe} value={especialidad.espe_cod_espe}>{especialidad.espe_nom_espe}</option>))}</select></div>
                    <div className={styles["citas-form-group"]}><label className={styles["citas-label"]}>Médico:</label><select className={styles["citas-select"]} name="cita_cod_medi" value={formData.cita_cod_medi} onChange={handleInputChange} required disabled={!formData.cita_cod_espe || medicos.length === 0}><option value="">Seleccione un médico</option>{medicos.map((medico) => (<option key={medico.medic_cod_medic} value={medico.medic_cod_medic}>{medico.medic_nom_medic}</option>))}</select></div>
                    <div className={styles['form-button-container']}><button type="submit" className={`${styles["citas-btn"]} ${styles["citas-btn-primary"]}`} disabled={isSubmitting}>{isSubmitting ? "Guardando..." : editingCita ? "Actualizar Cita" : "Crear Cita"}</button></div>
                </div>
            </form>
            <div className={styles["citas-table-container"]}>
                <h2 className={styles["citas-subtitle"]}>Citas Agendadas</h2>
                {citas.length === 0 ? (<p>No hay citas registradas para la ubicación seleccionada.</p>) : (
                    <table className={styles["citas-table"]}>
                        <thead>
                            <tr>
                                <th className={styles["col-fecha"]}>Fecha</th>
                                <th className={styles["col-hora"]}>Hora</th>
                                <th className={styles["col-paciente"]}>Paciente</th>
                                <th className={styles["col-especialidad"]}>Especialidad</th>
                                <th className={styles["col-medico"]}>Médico</th>
                                <th className={styles["col-creado"]}>Creado por</th>
                                <th className={styles["col-acciones"]}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {citas.map((cita) => (
                                <tr key={cita.cita_cod_cita}>
                                    <td className={styles["col-fecha"]}>{formatFecha(cita.cita_fec_cita)}</td>
                                    <td className={styles["col-hora"]}>{cita.cita_hor_cita?.slice(0, 5) || ''}</td>
                                    <td className={styles["col-paciente"]}>{cita.paciente?.pacie_nom_pacie ? `${cita.paciente.pacie_ape_pacie} ${cita.paciente.pacie_nom_pacie}` : `ID: ${cita.cita_cod_pacie}`}</td>
                                    <td className={styles["col-especialidad"]}>{cita.especialidad_nombre}</td>
                                    <td className={styles["col-medico"]}>{cita.medico?.medic_nom_medic}</td>
                                    <td className={styles["col-creado"]}>{cita.creado_por_usuario || 'N/A'}</td>
                                    <td className={styles["col-acciones"]}>
                                        <div className={styles["citas-actions"]}>
                                            <button className={`${styles["citas-btn"]} ${styles["citas-btn-warning"]}`} onClick={() => handleEdit(cita)}>Editar</button>
                                            {cita.cita_cod_espe === 1 && (<button className={`${styles["citas-btn"]} ${styles["citas-btn-info"]}`} onClick={() => handleIrATriaje(cita)}>Triaje</button>)}
                                            <button className={`${styles["citas-btn"]} ${styles["citas-btn-danger"]}`} onClick={() => handleDelete(cita.cita_cod_cita)}>Cancelar</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default Citas;