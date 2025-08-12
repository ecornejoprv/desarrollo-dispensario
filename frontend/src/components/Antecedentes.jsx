import React, { useState, useEffect } from 'react'; // Se unifica la importación de React.
import PropTypes from 'prop-types';
import api from "../api";
import styles from "./styles/antecedentes.module.css";
import AlergiasComponent from './AlergiasComponent';
import { EvaluacionOsteomuscularViewer } from "../components/EvaluacionOsteomuscularViewer";
import AnticonceptivosComponent from './anticonceptivos';

  // Componente de Antecedentes Personales
  const AntecedentesPersonales = ({ pacienteId }) => {
    // (El código interno de este componente va aquí, sin cambios)
    const [antecedentes, setAntecedentes] = useState([]);
    const [nuevaObservacion, setNuevaObservacion] = useState('');
    const [editandoId, setEditandoId] = useState(null);
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
      if (pacienteId) {
        cargarAntecedentes();
      }
    }, [pacienteId]);

    const cargarAntecedentes = async () => {
      setCargando(true);
      try {
        const response = await api.get(`/api/v1/antecedentes/personales/${pacienteId}`);
        setAntecedentes(response.data);
      } catch (error) {
        console.error("Error al cargar antecedentes personales:", error);
      } finally {
        setCargando(false);
      }
    };

    const iniciarEdicion = (antecedente) => {
      setEditandoId(antecedente.anper_cod_anper);
      setNuevaObservacion(antecedente.anper_obs_anper);
    };

    const cancelarEdicion = () => {
      setEditandoId(null);
      setNuevaObservacion('');
    };

    const guardarAntecedente = async () => {
      if (!nuevaObservacion.trim()) return;
      try {
        if (editandoId) {
          await api.put(`/api/v1/antecedentes/personales/${editandoId}`, { observacion: nuevaObservacion });
        } else {
          await api.post('/api/v1/antecedentes/personales', { pacienteId, observacion: nuevaObservacion });
        }
        await cargarAntecedentes();
        cancelarEdicion();
      } catch (error) {
        console.error("Error al guardar antecedente:", error);
      }
    };

    const eliminarAntecedente = async (id) => {
      try {
        await api.delete(`/api/v1/antecedentes/personales/${id}`);
        await cargarAntecedentes();
      } catch (error) {
        console.error("Error al eliminar antecedente:", error);
      }
    };

    if (cargando) return <p>Cargando antecedentes personales...</p>;

    return (
      <div>
        <table className={styles.tablaAntecedentes}>
          <thead>
            <tr>
              <th className={styles.thNormal}>Observación</th>
              <th className={styles.thAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {antecedentes.map((item) => (
              <tr key={item.anper_cod_anper}>
                <td>
                  {editandoId === item.anper_cod_anper ? (
                    <input type="text" value={nuevaObservacion} onChange={(e) => setNuevaObservacion(e.target.value)} className={styles.input} />
                  ) : (
                    item.anper_obs_anper
                  )}
                </td>
                <td>
                  {editandoId === item.anper_cod_anper ? (
                    <>
                      <button onClick={guardarAntecedente} className={styles.botonGuardar}>Guardar</button>
                      <button onClick={cancelarEdicion} className={styles.botonCancelar}>Cancelar</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => iniciarEdicion(item)} className={styles.botonEditar}>Editar</button>
                      <button onClick={() => eliminarAntecedente(item.anper_cod_anper)} className={styles.botonEliminar}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!editandoId && (
          <div className={styles.agregarFila}>
            <input type="text" value={nuevaObservacion} onChange={(e) => setNuevaObservacion(e.target.value)} placeholder="Nueva observación" className={styles.input} />
            <button onClick={guardarAntecedente} className={styles.botonAgregar}>+</button>
          </div>
        )}
      </div>
    );
  };
  AntecedentesPersonales.propTypes = { pacienteId: PropTypes.string.isRequired };

  // Componente de Antecedentes Gineco-Obstétricos
  const AntecedentesGinecoObstetricos = ({ pacienteId }) => {
    const [antecedentes, setAntecedentes] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [formData, setFormData] = useState({
      numCiclos: '',
      tiempoCiclos: '',
      fum: '',
      numGestas: 0,
      numPartos: 0,
      numCesareas: 0,
      numAbortos: 0,
      numHijosVivos: 0,
      numHijosMuertos: 0,
      actividadSexual: 'No',
      metodoanticonceptivo: ''
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
      cargarAntecedentes();
    }, [pacienteId]);

    const cargarAntecedentes = async () => {
      try {        
        const response = await api.get(`/api/v1/antecedentes/gineco/${pacienteId}`);
        setAntecedentes(response.data);
      } catch (error) {
        console.error("Error al cargar antecedentes gineco-obstétricos:", error);
      } finally {
        setCargando(false);
      }
    };

    const iniciarEdicion = (antecedente) => {
      setEditandoId(antecedente.angin_cod_angin);
      setFormData({
        numCiclos: antecedente.angin_nci_angin || '',
        tiempoCiclos: antecedente.angi_tie_ciclos || '',
        fum: antecedente.angi_fum_angi || '',
        numGestas: antecedente.angi_nge_angi || 0,
        numPartos: antecedente.angi_npa_angi || 0,
        numCesareas: antecedente.angi_nce_angi || 0,
        numAbortos: antecedente.angi_nab_angi || 0,
        numHijosVivos: antecedente.angi_nvi_angi || 0,
        numHijosMuertos: antecedente.angi_nmu_angi || 0,
        actividadSexual: antecedente.angi_ase_angi || 'No',
        metodoanticonceptivo: antecedente.angi_man_angi || ''
      });
    };

    const cancelarEdicion = () => {
      setEditandoId(null);
      setFormData({
        numCiclos: '',
        tiempoCiclos: '',
        fum: '',
        numGestas: 0,
        numPartos: 0,
        numCesareas: 0,
        numAbortos: 0,
        numHijosVivos: 0,
        numHijosMuertos: 0,
        actividadSexual: 'No',
        metodoanticonceptivo: ''
      });
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

        const guardarAntecedente = async () => {
      try {
        if (editandoId) {          
          await api.put(`/api/v1/antecedentes/gineco/${editandoId}`, formData);
        } else {          
          await api.post('/api/v1/antecedentes/gineco', { pacienteId, ...formData });
        }
        await cargarAntecedentes();
        cancelarEdicion();
      } catch (error) {
        console.error("Error al guardar antecedente gineco-obstétrico:", error);
      }
    };

    const eliminarAntecedente = async (id) => {
      try {        
        await api.delete(`/api/v1/antecedentes/gineco/${id}`);
        await cargarAntecedentes();
      } catch (error) {
        console.error("Error al eliminar antecedente gineco-obstétrico:", error);
      }
    };

    if (cargando) return <p>Cargando antecedentes gineco-obstétricos...</p>;

    return (
      <div>
        <table className={styles.tablaAntecedentes}>
          <thead>
            <tr>
              <th className={styles.thNormal}>Fecha</th>
              <th className={styles.thNormal}>FUM</th>
              <th className={styles.thNormal}>Gestas</th>
              <th className={styles.thNormal}>Partos</th>
              <th className={styles.thNormal}>Cesáreas</th>
              <th className={styles.thNormal}>Abortos</th>
              <th className={styles.thNormal}>Hijos Vivos</th>
              <th className={styles.thNormal}>Hijos Muertos</th>
              <th className={styles.thNormal}>Act. Sexual</th>
              <th className={styles.thNormal}>Método Anticonceptivo</th>
              <th className={styles.thAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {antecedentes.map((item) => (
              <tr key={item.angin_cod_angin}>
                <td>{new Date(item.angin_fec_angin).toLocaleDateString()}</td>
                <td>{item.angi_fum_angi ? new Date(item.angi_fum_angi).toLocaleDateString() : '-'}</td>
                <td>{item.angi_nge_angi}</td>
                <td>{item.angi_npa_angi}</td>
                <td>{item.angi_nce_angi}</td>
                <td>{item.angi_nab_angi}</td>
                <td>{item.angi_nvi_angi}</td>
                <td>{item.angi_nmu_angi}</td>
                <td>{item.angi_ase_angi}</td>
                <td>{item.angi_man_angi}</td>
                <td>
                  <button onClick={() => iniciarEdicion(item)} className={styles.botonEditar}>
                    Editar
                  </button>
                  <button onClick={() => eliminarAntecedente(item.angin_cod_angin)} className={styles.botonEliminar}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className={styles.formularioGineco}>
          <h3>{editandoId ? 'Editando Antecedente' : 'Agregar Nuevo Antecedente'}</h3>
          
          <div className={styles.filaFormulario}>
            <label>FUM:</label>
            <input
              type="date"
              name="fum"
              value={formData.fum}
              onChange={handleChange}
              className={styles.input}
            />
            
            <label>N° Gestas:</label>
            <input
              type="number"
              name="numGestas"
              value={formData.numGestas}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.filaFormulario}>
            <label>N° Partos:</label>
            <input
              type="number"
              name="numPartos"
              value={formData.numPartos}
              onChange={handleChange}
              className={styles.input}
            />
            
            <label>N° Cesáreas:</label>
            <input
              type="number"
              name="numCesareas"
              value={formData.numCesareas}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.filaFormulario}>
            <label>N° Hijos Vivos:</label>
            <input
              type="number"
              name="numHijosVivos"
              value={formData.numHijosVivos}
              onChange={handleChange}
              className={styles.input}
            />
            
            <label>N° Hijos Muertos:</label>
            <input
              type="number"
              name="numHijosMuertos"
              value={formData.numHijosMuertos}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.filaFormulario}>
            <label>N° Abortos:</label>
            <input
              type="number"
              name="numAbortos"
              value={formData.numAbortos}
              onChange={handleChange}
              className={styles.input}
            />
            
            <label>Act. Sexual:</label>
            <select
              name="actividadSexual"
              value={formData.actividadSexual}
              onChange={handleChange}
              className={styles.select}
            >
              <option value="Si">Si</option>
              <option value="No">No</option>
            </select>

            {formData.actividadSexual === 'Si' && (
              <>
                <label>Método Anticonceptivo:</label>
                <input
                  type="text"
                  name="metodoanticonceptivo"
                  value={formData.metodoanticonceptivo}
                  onChange={handleChange}
                  className={styles.input}
                />
              </>
            )}
          </div>
          
          <div className={styles.botonesFormulario}>
            <button onClick={guardarAntecedente} className={styles.botonGuardar}>
              {editandoId ? 'Actualizar' : 'Agregar'}
            </button>
            {editandoId && (
              <button onClick={cancelarEdicion} className={styles.botonCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  AntecedentesGinecoObstetricos.propTypes = { pacienteId: PropTypes.string.isRequired };

  // Componente de Antecedentes Laborales
  const AntecedentesLaborales = ({ pacienteId }) => {
    const [antecedentes, setAntecedentes] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [formData, setFormData] = useState({
      empresa: '',
      puesto: '',
      actividad: '',
      tiempo: '',
      riesgos: {
        fisico: 0,
        mecanico: 0,
        quimico: 0,
        biologico: 0,
        ergonomico: 0,
        psicosocial: 0
      }
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
      cargarAntecedentes();
    }, [pacienteId]);

    const cargarAntecedentes = async () => {
      try {        
        const response = await api.get(`/api/v1/antecedentes/trabajo/${pacienteId}`);
        setAntecedentes(response.data);
      } catch (error) {
        console.error("Error al cargar antecedentes laborales:", error);
      } finally {
        setCargando(false);
      }
    };

    const iniciarEdicion = (antecedente) => {
      setEditandoId(antecedente.antra_cod_antra);
      setFormData({
        empresa: antecedente.antra_empr_antra,
        puesto: antecedente.antra_pue_antra,
        actividad: antecedente.antra_act_antra,
        tiempo: antecedente.antra_tie_antra,
        riesgos: {
          fisico: antecedente.antra_rfi_antra,
          mecanico: antecedente.antra_rme_antra,
          quimico: antecedente.antra_rqui_antra,
          biologico: antecedente.antra_rbi_antra,
          ergonomico: antecedente.antra_rer_antra,
          psicosocial: antecedente.antra_rps_antra
        }
      });
    };

    const cancelarEdicion = () => {
      setEditandoId(null);
      setFormData({
        empresa: '',
        puesto: '',
        actividad: '',
        tiempo: '',
        riesgos: {
          fisico: 0,
          mecanico: 0,
          quimico: 0,
          biologico: 0,
          ergonomico: 0,
          psicosocial: 0
        }
      });
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleCheckboxChange = (riesgo) => {
      setFormData(prev => ({
        ...prev,
        riesgos: {
          ...prev.riesgos,
          [riesgo]: prev.riesgos[riesgo] === 0 ? 1 : 0
        }
      }));
    };

    const guardarAntecedente = async () => {
      try {
        if (editandoId) {
          // Actualizar existente
          await api.put(`/api/v1/antecedentes/trabajo/${editandoId}`, {
            ...formData,
            riesgoFisico: formData.riesgos.fisico === 1,
            riesgoMecanico: formData.riesgos.mecanico === 1,
            riesgoQuimico: formData.riesgos.quimico === 1,
            riesgoBiologico: formData.riesgos.biologico === 1,
            riesgoErgonomico: formData.riesgos.ergonomico === 1,
            riesgoPsicosocial: formData.riesgos.psicosocial === 1
          });
        } else {
          // Crear nuevo
          await api.post('/api/v1/antecedentes/trabajo', {
            pacienteId,
            ...formData,
            riesgoFisico: formData.riesgos.fisico === 1,
            riesgoMecanico: formData.riesgos.mecanico === 1,
            riesgoQuimico: formData.riesgos.quimico === 1,
            riesgoBiologico: formData.riesgos.biologico === 1,
            riesgoErgonomico: formData.riesgos.ergonomico === 1,
            riesgoPsicosocial: formData.riesgos.psicosocial === 1
          });
        }
        
        await cargarAntecedentes();
        cancelarEdicion();
      } catch (error) {
        console.error("Error al guardar antecedente laboral:", error);
      }
    };

    const eliminarAntecedente = async (id) => {
      try {
        await api.delete(`/api/v1/antecedentes/trabajo/${id}`);
        await cargarAntecedentes();
      } catch (error) {
        console.error("Error al eliminar antecedente laboral:", error);
      }
    };

    if (cargando) return <p>Cargando antecedentes laborales...</p>;

    return (
      <div>
        <table className={styles.tablaAntecedentes}>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Empresa</th>
              <th>Puesto</th>
               <th>Actividad</th>
              <th>Tiempo(Meses)</th>
              <th>Riesgos</th>
              <th className={styles.thAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {antecedentes.map((item) => {
              const riesgos = [];
              if (item.antra_rfi_antra == 1) riesgos.push("Físico");
              if (item.antra_rme_antra == 1) riesgos.push("Mecánico");
              if (item.antra_rqui_antra == 1) riesgos.push("Químico");
              if (item.antra_rbi_antra == 1) riesgos.push("Biológico");
              if (item.antra_rer_antra == 1) riesgos.push("Ergonómico");
              if (item.antra_rps_antra == 1) riesgos.push("Psicosocial");
              
              return (
                <tr key={item.antra_cod_antra}>
                  <td>{new Date(item.antra_fec_antra).toLocaleDateString()}</td>
                  <td>{item.antra_empr_antra}</td>
                  <td>{item.antra_pue_antra}</td>
                   <td>{item.antra_act_antra}</td>
                  <td>{item.antra_tie_antra}</td>
                  <td>{riesgos.join(", ")}</td>
                  <td>
                    <button onClick={() => iniciarEdicion(item)} className={styles.botonEditar}>
                      Editar
                    </button>
                    <button onClick={() => eliminarAntecedente(item.antra_cod_antra)} className={styles.botonEliminar}>
                      Eliminar
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        <div className={styles.formularioLaboral}>
          <h3>{editandoId ? 'Editando Antecedente' : 'Agregar Nuevo Antecedente'}</h3>
          
          <div className={styles.filaFormulario}>
            <label>Empresa:</label>
            <input
              type="text"
              name="empresa"
              value={formData.empresa}
              onChange={handleChange}
              className={styles.input}
            />
            
            <label>Puesto:</label>
            <input
              type="text"
              name="puesto"
              value={formData.puesto}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.filaFormulario}>
            <label>Actividad:</label>
            <input
              type="text"
              name="actividad"
              value={formData.actividad}
              onChange={handleChange}
              className={styles.input}
            />
            
            <label>Tiempo (meses):</label>
            <input
              type="number"
              name="tiempo"
              value={formData.tiempo}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.riesgosContainer}>
            <h4>Riesgos Laborales:</h4>
            <div className={styles.checkboxGroup}>
              {Object.keys(formData.riesgos).map((riesgo) => (
                <label key={riesgo} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    checked={formData.riesgos[riesgo] === 1}
                    onChange={() => handleCheckboxChange(riesgo)}
                  />
                  {riesgo.charAt(0).toUpperCase() + riesgo.slice(1)}
                </label>
              ))}
            </div>
          </div>
          
          <div className={styles.botonesFormulario}>
            <button onClick={guardarAntecedente} className={styles.botonGuardar}>
              {editandoId ? 'Actualizar' : 'Agregar'}
            </button>
            {editandoId && (
              <button onClick={cancelarEdicion} className={styles.botonCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  AntecedentesLaborales.propTypes = { pacienteId: PropTypes.string.isRequired };

  // Componente de Hábitos Tóxicos/Estilo de Vida
  const HabitosToxicosEstiloVida = ({ pacienteId }) => {
    const [habitos, setHabitos] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [formData, setFormData] = useState({
      detalleConsumo: '', tiempoConsumo: '', cantidadConsumo: '',
      tiempoAbstinencia: '', descripcionEstiloVida: '', tiempoPractica: ''
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
      cargarHabitos();
    }, [pacienteId]);

    const cargarHabitos = async () => {
      try {
        const response = await api.get(`/api/v1/antecedentes/toxico/${pacienteId}`);
        setHabitos(response.data);
      } catch (error) {
        console.error("Error al cargar hábitos y estilos de vida:", error);
      } finally {
        setCargando(false);
      }
    };

    const iniciarEdicion = (habito) => {
      setEditandoId(habito.htev_cod_htev);
      setFormData({
        detalleConsumo: habito.htev_dco_htev || '',
        tiempoConsumo: habito.htev_tco_htev || '',
        cantidadConsumo: habito.htev_cco_htev || '',
        tiempoAbstinencia: habito.htev_tab_htev || '',
        descripcionEstiloVida: habito.htev_dev_htev || '',
        tiempoPractica: habito.htev_tes_htev || ''
      });
    };

    const cancelarEdicion = () => {
      setEditandoId(null);
      setFormData({
        detalleConsumo: '', tiempoConsumo: '', cantidadConsumo: '',
        tiempoAbstinencia: '', descripcionEstiloVida: '', tiempoPractica: ''
      });
    };

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };

    // --- NUEVA FUNCIÓN: Guardar solo Hábito Tóxico ---
    const guardarHabitoToxico = async () => {
      if (!formData.detalleConsumo.trim()) {
        alert("Debe ingresar el detalle del consumo.");
        return;
      }
      try {
        const dataToSend = {
            detalleConsumo: formData.detalleConsumo,
            tiempoConsumo: formData.tiempoConsumo,
            cantidadConsumo: formData.cantidadConsumo,
            tiempoAbstinencia: formData.tiempoAbstinencia,
        };
        if (editandoId) {
          await api.put(`/api/v1/antecedentes/toxico/${editandoId}`, dataToSend);
        } else {
          await api.post('/api/v1/antecedentes/toxico', { pacienteId, ...dataToSend });
        }
        await cargarHabitos();
        cancelarEdicion();
      } catch (error) {
        console.error("Error al guardar hábito tóxico:", error);
      }
    };

    // --- NUEVA FUNCIÓN: Guardar solo Estilo de Vida ---
    const guardarEstiloVida = async () => {
      if (!formData.descripcionEstiloVida.trim()) {
        alert("Debe ingresar la descripción del estilo de vida.");
        return;
      }
      try {
        const dataToSend = {
            descripcionEstiloVida: formData.descripcionEstiloVida,
            tiempoPractica: formData.tiempoPractica,
        };
        if (editandoId) {
          await api.put(`/api/v1/antecedentes/toxico/${editandoId}`, dataToSend);
        } else {
          await api.post('/api/v1/antecedentes/toxico', { pacienteId, ...dataToSend });
        }
        await cargarHabitos();
        cancelarEdicion();
      } catch (error) {
        console.error("Error al guardar estilo de vida:", error);
      }
    };

    const eliminarHabito = async (id) => {
      try {
        await api.delete(`/api/v1/antecedentes/toxico/${id}`);
        await cargarHabitos();
      } catch (error) {
        console.error("Error al eliminar hábito/estilo de vida:", error);
      }
    };

    if (cargando) return <p>Cargando hábitos tóxicos y estilos de vida...</p>;

    return (
      <div>
        <table className={styles.tablaAntecedentes}>
          <thead>
            <tr>
              <th className={styles.thNormal}>Tipo</th>
              <th className={styles.thNormal}>Detalle</th>
              <th className={styles.thNormal}>Tiempo</th>
              <th className={styles.thNormal}>Cantidad</th>
              <th className={styles.thNormal}>Abstinencia</th>
              <th className={styles.thAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {habitos.map((item) => (
              <tr key={item.htev_cod_htev}>
                <td>{item.htev_dco_htev ? "Consumo" : "Estilo Vida"}</td>
                <td>{item.htev_dco_htev || item.htev_dev_htev}</td>
                <td>{item.htev_tco_htev || item.htev_tes_htev} {item.htev_tco_htev ? "meses" : "años"}</td>
                <td>{item.htev_cco_htev ? `${item.htev_cco_htev} ` : '-'}</td>
                <td>{item.htev_tab_htev ? `${item.htev_tab_htev} meses` : '-'}</td>
                <td>
                  <button onClick={() => iniciarEdicion(item)} className={styles.botonEditar}>
                    Editar
                  </button>
                  <button onClick={() => eliminarHabito(item.htev_cod_htev)} className={styles.botonEliminar}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className={styles.formularioHabitos}>
          <h3>{editandoId ? 'Editando Registro' : 'Agregar Nuevo Registro'}</h3>
          
          <div className={styles.seccionFormulario}>
            <h4>Hábitos Tóxicos</h4>
            <div className={styles.filaFormulario}><label>Detalle Consumo:</label><input type="text" name="detalleConsumo" value={formData.detalleConsumo} onChange={handleChange} placeholder="Ej: Tabaco, Alcohol, etc." className={styles.input}/></div>
            <div className={styles.filaFormulario}><label>Tiempo Consumo (meses):</label><input type="number" name="tiempoConsumo" value={formData.tiempoConsumo} onChange={handleChange} className={styles.input}/><label>Cantidad Consumo:</label><input type="text" name="cantidadConsumo" value={formData.cantidadConsumo} onChange={handleChange} className={styles.input}/></div>
            <div className={styles.filaFormulario}><label>Tiempo Abstinencia (meses):</label><input type="number" name="tiempoAbstinencia" value={formData.tiempoAbstinencia} onChange={handleChange} className={styles.input}/></div>
            <div className={styles.botonesFormulario}>
              <button onClick={guardarHabitoToxico} className={styles.botonGuardar}>{editandoId ? 'Actualizar Hábito' : 'Agregar Hábito'}</button>
            </div>
          </div>
          
          <div className={styles.seccionFormulario}>
            <h4>Estilo de Vida</h4>
            <div className={styles.filaFormulario}><label>Descripción:</label><input type="text" name="descripcionEstiloVida" value={formData.descripcionEstiloVida} onChange={handleChange} placeholder="Ej: Ejercicio, Dieta, etc." className={styles.input}/></div>
            <div className={styles.filaFormulario}><label>Tiempo Práctica:</label><input type="text" name="tiempoPractica" value={formData.tiempoPractica} onChange={handleChange} className={styles.input}/></div>
            <div className={styles.botonesFormulario}>
              <button onClick={guardarEstiloVida} className={styles.botonGuardar}>{editandoId ? 'Actualizar Estilo de Vida' : 'Agregar Estilo de Vida'}</button>
            </div>
          </div>

          {editandoId && (<div className={styles.botonesFormulario}><button onClick={cancelarEdicion} className={styles.botonCancelar}>Cancelar Edición</button></div>)}
        </div>
      </div>
    );
  };
  HabitosToxicosEstiloVida.propTypes = { pacienteId: PropTypes.string.isRequired };

  // Componente de Accidentes/Enfermedades
  const AccidentesEnfermedades = ({ pacienteId }) => {
    const [registros, setRegistros] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [formData, setFormData] = useState({
      descripcion: '',
      registradoIess: false,
      detalle: ''
    });
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
      cargarRegistros();
    }, [pacienteId]);

    const cargarRegistros = async () => {
      try {
        const response = await api.get(`/api/v1/antecedentes/accidentes/${pacienteId}`);
        setRegistros(response.data);
      } catch (error) {
        console.error("Error al cargar accidentes/enfermedades:", error);
      } finally {
        setCargando(false);
      }
    };

    const iniciarEdicion = (registro) => {
      setEditandoId(registro.accep_cod_accep);
      setFormData({
        descripcion: registro.accep_des_accep || '',
        registradoIess: registro.accep_iess_accep === 1,
        detalle: registro.accep_dae_accep || ''
      });
    };

    const cancelarEdicion = () => {
      setEditandoId(null);
      setFormData({
        descripcion: '',
        registradoIess: false,
        detalle: ''
      });
    };

    const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    };

    const guardarRegistro = async () => {
      if (!formData.descripcion.trim()) return;
      
      try {
        if (editandoId) {
          // Actualizar existente
          await api.put(`/api/v1/antecedentes/accidentes/${editandoId}`, formData);
        } else {
          // Crear nuevo
          await api.post('/api/v1/antecedentes/accidentes', {
            pacienteId,
            ...formData
          });
        }
        
        await cargarRegistros();
        cancelarEdicion();
      } catch (error) {
        console.error("Error al guardar accidente/enfermedad:", error);
      }
    };

    const eliminarRegistro = async (id) => {
      try {
        await api.delete(`/api/v1/antecedentes/accidentes/${id}`);
        await cargarRegistros();
      } catch (error) {
        console.error("Error al eliminar accidente/enfermedad:", error);
      }
    };

    if (cargando) return <p>Cargando accidentes/enfermedades...</p>;

    return (
      <div>
        <table className={styles.tablaAntecedentes}>
          <thead>
            <tr>
              <th className={styles.thNormal}>Descripción</th>
              <th className={styles.thNormal}>Registrado IESS</th>
              <th className={styles.thNormal}>Detalle</th>
              <th className={styles.thAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {registros.map((item) => (
              <tr key={item.accep_cod_accep}>
                <td>{item.accep_des_accep}</td>
                <td>{item.accep_iess_accep ? 'Sí' : 'No'}</td>
                <td>{item.accep_dae_accep || '-'}</td>
                <td>
                  <button onClick={() => iniciarEdicion(item)} className={styles.botonEditar}>
                    Editar
                  </button>
                  <button onClick={() => eliminarRegistro(item.accep_cod_accep)} className={styles.botonEliminar}>
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className={styles.formularioAccidentes}>
          <h3>{editandoId ? 'Editando Registro' : 'Agregar Nuevo Registro'}</h3>
          
          <div className={styles.filaFormulario}>
            <label>Descripción:</label>
            <input
              type="text"
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.filaFormulario}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                name="registradoIess"
                checked={formData.registradoIess}
                onChange={handleChange}
              />
              Registrado IESS
            </label>
            
            <label>Detalle:</label>
            <input
              type="text"
              name="detalle"
              value={formData.detalle}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
          
          <div className={styles.botonesFormulario}>
            <button onClick={guardarRegistro} className={styles.botonGuardar}>
              {editandoId ? 'Actualizar' : 'Agregar'}
            </button>
            {editandoId && (
              <button onClick={cancelarEdicion} className={styles.botonCancelar}>
                Cancelar
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };
  AccidentesEnfermedades.propTypes = { pacienteId: PropTypes.string.isRequired };

  // Componente de Actividades Extralaborales
  const ActividadesExtralaborales = ({ pacienteId }) => {
    const [actividades, setActividades] = useState([]);
    const [editandoId, setEditandoId] = useState(null);
    const [nuevaActividad, setNuevaActividad] = useState('');
    const [cargando, setCargando] = useState(true);

    useEffect(() => {
      cargarActividades();
    }, [pacienteId]);

    const cargarActividades = async () => {
      try {
        const response = await api.get(`/api/v1/antecedentes/extralaborales/${pacienteId}`);
        setActividades(response.data);
      } catch (error) {
        console.error("Error al cargar actividades extralaborales:", error);
      } finally {
        setCargando(false);
      }
    };

    const iniciarEdicion = (actividad) => {
      setEditandoId(actividad.aexla_cod_aexla);
      setNuevaActividad(actividad.aexla_des_aexla);
    };

    const cancelarEdicion = () => {
      setEditandoId(null);
      setNuevaActividad('');
    };

    const guardarActividad = async () => {
      if (!nuevaActividad.trim()) return;
      
      try {
        if (editandoId) {
          // Actualizar existente
          await api.put(`/api/v1/antecedentes/extralaborales/${editandoId}`, {
            descripcion: nuevaActividad
          });
        } else {
          // Crear nuevo
          await api.post('/api/v1/antecedentes/extralaborales', {
            pacienteId,
            descripcion: nuevaActividad
          });
        }
        
        await cargarActividades();
        cancelarEdicion();
      } catch (error) {
        console.error("Error al guardar actividad extralaboral:", error);
      }
    };

    const eliminarActividad = async (id) => {
      try {
        await api.delete(`/api/v1/antecedentes/extralaborales/${id}`);
        await cargarActividades();
      } catch (error) {
        console.error("Error al eliminar actividad extralaboral:", error);
      }
    };

    if (cargando) return <p>Cargando actividades extralaborales...</p>;

    return (
      <div>
        <table className={styles.tablaAntecedentes}>
          <thead>
            <tr>
              <th className={styles.thNormal}>Descripción</th>
              <th className={styles.thAcciones}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {actividades.map((item) => (
              <tr key={item.aexla_cod_aexla}>
                <td>
                  {editandoId === item.aexla_cod_aexla ? (
                    <input
                      type="text"
                      value={nuevaActividad}
                      onChange={(e) => setNuevaActividad(e.target.value)}
                      className={styles.input}
                    />
                  ) : (
                    item.aexla_des_aexla
                  )}
                </td>
                <td>
                  {editandoId === item.aexla_cod_aexla ? (
                    <>
                      <button onClick={guardarActividad} className={styles.botonGuardar}>
                        Guardar
                      </button>
                      <button onClick={cancelarEdicion} className={styles.botonCancelar}>
                        Cancelar
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => iniciarEdicion(item)} className={styles.botonEditar}>
                        Editar
                      </button>
                      <button onClick={() => eliminarActividad(item.aexla_cod_aexla)} className={styles.botonEliminar}>
                        Eliminar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {!editandoId && (
          <div className={styles.agregarFila}>
            <input
              type="text"
              value={nuevaActividad}
              onChange={(e) => setNuevaActividad(e.target.value)}
              placeholder="Nueva actividad"
              className={styles.input}
            />
            <button onClick={guardarActividad} className={styles.botonAgregar}>
              +
            </button>
          </div>
        )}
      </div>
    );
  };
  ActividadesExtralaborales.propTypes = { pacienteId: PropTypes.string.isRequired };

const AntecedentesCompletos = ({ pacienteId, sexo }) => {
  // Estado para gestionar cuál es la pestaña activa actualmente.
  const [activeTab, setActiveTab] = useState(null);

  // Definición del array de pestañas.
  // Ahora, el contenido de cada pestaña es una instancia de un componente bien definido.
  let tabs = [
    { id: "personales", label: "Personales", content: <AntecedentesPersonales pacienteId={pacienteId} /> },
    { id: "laborales", label: "Laborales", content: <AntecedentesLaborales pacienteId={pacienteId} /> },
    { id: "habitos", label: "Hábitos/Estilo Vida", content: <HabitosToxicosEstiloVida pacienteId={pacienteId} /> },
    { id: "accidentes", label: "Accidentes/Enf.", content: <AccidentesEnfermedades pacienteId={pacienteId} /> },
    { id: "extralaborales", label: "Extralaborales", content: <ActividadesExtralaborales pacienteId={pacienteId} /> },
    { id: "alergias", label: "Alergias", content: <AlergiasComponent pacienteId={pacienteId} /> },
    { id: "osteomuscular", label: "Eval. Osteomuscular", content: <EvaluacionOsteomuscularViewer pacienteId={pacienteId} /> },
  ];

  if (sexo === 2) {
    const tabsGinecologicas = [
      { id: "gineco", label: "Gineco-Obstétricos", content: <AntecedentesGinecoObstetricos pacienteId={pacienteId} /> },
      { id: "anticonceptivos", label: "Anticonceptivos", content: <AnticonceptivosComponent pacienteId={pacienteId} /> },
    ];
    tabs.splice(1, 0, ...tabsGinecologicas);
  }

  const handleTabClick = (tabId) => {
    // Se comprueba si la pestaña en la que se hizo clic es la misma que ya está activa.
    if (tabId === activeTab) {
      // Si es la misma, se cierra el acordeón estableciendo el estado a null.
      setActiveTab(null);
    } else {
      // Si es una pestaña diferente, se abre estableciendo su ID como el activo.
      setActiveTab(tabId);
    }
  };

  // Renderizado del contenedor de pestañas y su contenido.
  return (
    // Se añade un div contenedor con una nueva clase para darle el estilo de "tarjeta".
    <div className={styles.antecedentesCard}>
      
      {/* La cabecera con los botones de las pestañas siempre es visible. */}
      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <button
            // La clave única no cambia.
            key={tab.id}
            // El evento onClick ahora llama a nuestra nueva función 'handleTabClick'.
            onClick={() => handleTabClick(tab.id)}
            // La clase del botón ahora cambia dinámicamente para resaltar la pestaña activa.
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ""}`}
          >
            {/* El texto de la pestaña no cambia. */}
            {tab.label}
          </button>
        ))}
      </div> 

      {/* El contenido de la pestaña ahora solo se renderiza si 'activeTab' NO es null. */}
      {/* Este es el mecanismo que permite mostrar y ocultar toda la sección de contenido. */}
      {activeTab && (
        <div className={styles.tabsContent}>
          {tabs.map((tab) => (
            // La lógica interna para mostrar el contenido correcto no cambia.
            activeTab === tab.id && (
              <div key={tab.id} className={styles.tabContent}>
                {tab.content}
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
};

AntecedentesCompletos.propTypes = {
  sexo: PropTypes.number,
  pacienteId: PropTypes.string.isRequired
};

export default React.memo(AntecedentesCompletos);