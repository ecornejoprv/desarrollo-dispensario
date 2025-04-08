import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import api from "../api";
import AtencionList from "../components/AtencionList";
import styles from "./styles/historia.module.css";

const especialidades = ["Todas", "Medicina", "Odontologia", "Fisioterapia", "Enfermeria"];
const opcionesRegistros = [10, 20, 50, 100];

const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date();
  const nacimiento = new Date(fechaNacimiento);
  let edad = hoy.getFullYear() - nacimiento.getFullYear();
  const mes = hoy.getMonth() - nacimiento.getMonth();

  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--;
  }

  return edad;
};

const HorizontalTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);

  return (
    <div className={styles.horizontalTabsContainer}>
      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div> 
      <div className={styles.tabsContent}>
        {tabs.map((tab) => (
          activeTab === tab.id && (
            <div key={tab.id} className={styles.tabContent}>
              {tab.content}
            </div>
          )
        ))}
      </div>
    </div>
  );
};

const AntecedentesPersonales = ({ pacienteId }) => {
  const [antecedentes, setAntecedentes] = useState([]);
  const [nuevaObservacion, setNuevaObservacion] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAntecedentes = async () => {
      try {
        const response = await api.get(`/api/v1/personales/${pacienteId}`);
        setAntecedentes(response.data);
      } catch (error) {
        console.error("Error al cargar antecedentes personales:", error);
      } finally {
        setCargando(false);
      }
    };

    if (pacienteId) cargarAntecedentes();
  }, [pacienteId]);

  const agregarAntecedente = async () => {
    if (!nuevaObservacion.trim()) return;
    
    try {
      const response = await api.post('/api/v1/personales', {
        pacienteId,
        observacion: nuevaObservacion
      });
      
      setAntecedentes([...antecedentes, response.data]);
      setNuevaObservacion('');
    } catch (error) {
      console.error("Error al agregar antecedente:", error);
    }
  };

  if (cargando) return <p>Cargando antecedentes personales...</p>;

  return (
    <div>
      <table className={styles.tablaAntecedentes}>
        <thead>
          <tr>
            <th className={styles.thNormal}>Fecha</th>
            <th className={styles.thNormal}>Observación</th>
          </tr>
        </thead>
        <tbody>
          {antecedentes.map((item) => (
            <tr key={item.anper_cod_anper}>
              <td>{new Date(item.anper_fec_anper).toLocaleDateString()}</td>
              <td>{item.anper_obs_anper}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.agregarFila}>
        <input
          type="text"
          value={nuevaObservacion}
          onChange={(e) => setNuevaObservacion(e.target.value)}
          placeholder="Nueva observación"
          className={styles.input}
        />
        <button onClick={agregarAntecedente} className={styles.botonAgregar}>
          +
        </button>
      </div>
    </div>
  );
};

const AntecedentesGinecoObstetricos = ({ pacienteId }) => {
  const [antecedentes, setAntecedentes] = useState([]);
  const [nuevoAntecedente, setNuevoAntecedente] = useState({
    numCiclos: '',
    tiempoCiclos: '',
    fum: '',
    numGestas: 0,
    numPartos: 0,
    numCesareas: 0,
    numAbortos: 0,
    numHijosVivos: 0,
    numHijosMuertos: 0,
    actividadSexual: 'No'
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAntecedentes = async () => {
      try {
        const response = await api.get(`/api/v1/gineco/${pacienteId}`);
        setAntecedentes(response.data);
      } catch (error) {
        console.error("Error al cargar antecedentes gineco-obstétricos:", error);
      } finally {
        setCargando(false);
      }
    };

    if (pacienteId) cargarAntecedentes();
  }, [pacienteId]);

  const agregarAntecedente = async () => {
    try {
      const response = await api.post('/api/v1/gineco', {
        pacienteId,
        ...nuevoAntecedente
      });
      
      setAntecedentes([...antecedentes, response.data]);
      setNuevoAntecedente({
        numCiclos: '',
        tiempoCiclos: '',
        fum: '',
        numGestas: 0,
        numPartos: 0,
        numCesareas: 0,
        numAbortos: 0,
        numHijosVivos: 0,
        numHijosMuertos: 0,
        actividadSexual: 'No'
      });
    } catch (error) {
      console.error("Error al agregar antecedente gineco-obstétrico:", error);
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
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.formularioGineco}>
        <div className={styles.filaFormulario}>
          <label>FUM:</label>
          <input
            type="date"
            value={nuevoAntecedente.fum}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, fum: e.target.value})}
            className={styles.input}
          />
          
          <label>N° Gestas:</label>
          <input
            type="number"
            value={nuevoAntecedente.numGestas}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, numGestas: e.target.value})}
            className={styles.input}
          />
        </div>
        
        <div className={styles.filaFormulario}>
          <label>N° Partos:</label>
          <input
            type="number"
            value={nuevoAntecedente.numPartos}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, numPartos: e.target.value})}
            className={styles.input}
          />
          
          <label>N° Cesáreas:</label>
          <input
            type="number"
            value={nuevoAntecedente.numCesareas}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, numCesareas: e.target.value})}
            className={styles.input}
          />
        </div>
        
        <div className={styles.filaFormulario}>
          <label>N° Abortos:</label>
          <input
            type="number"
            value={nuevoAntecedente.numAbortos}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, numAbortos: e.target.value})}
            className={styles.input}
          />
          
          <label>Act. Sexual:</label>
          <select
            value={nuevoAntecedente.actividadSexual}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, actividadSexual: e.target.value})}
            className={styles.select}
          >
            <option value="Si">Si</option>
            <option value="No">No</option>
          </select>
        </div>
        
        <button onClick={agregarAntecedente} className={styles.botonAgregar}>
          + Agregar
        </button>
      </div>
    </div>
  );
};

const AntecedentesLaborales = ({ pacienteId }) => {
  const [antecedentes, setAntecedentes] = useState([]);
  const [nuevoAntecedente, setNuevoAntecedente] = useState({
    empresa: '',
    puesto: '',
    actividad: '',
    tiempo: '',
    riesgos: {
      fisico: 0,
      medico: 0,
      quimico: 0,
      biologico: 0,
      ergonomico: 0,
      psicosocial: 0
    }
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarAntecedentes = async () => {
      try {
        const response = await api.get(`/api/v1/trabajo/${pacienteId}`);
        setAntecedentes(response.data);
      } catch (error) {
        console.error("Error al cargar antecedentes laborales:", error);
      } finally {
        setCargando(false);
      }
    };

    if (pacienteId) cargarAntecedentes();
  }, [pacienteId]);

  const handleCheckboxChange = (riesgo) => {
    setNuevoAntecedente({
      ...nuevoAntecedente,
      riesgos: {
        ...nuevoAntecedente.riesgos,
        [riesgo]: nuevoAntecedente.riesgos[riesgo] === 0 ? 1 : 0
      }
    });
  };

  const agregarAntecedente = async () => {
    try {
      const response = await api.post('/api/v1/trabajo', {
        pacienteId,
        empresa: nuevoAntecedente.empresa,
        puesto: nuevoAntecedente.puesto,
        actividad: nuevoAntecedente.actividad,
        tiempo: nuevoAntecedente.tiempo,
        riesgos: nuevoAntecedente.riesgos
      });
      
      setAntecedentes([...antecedentes, response.data]);
      setNuevoAntecedente({
        empresa: '',
        puesto: '',
        actividad: '',
        tiempo: '',
        riesgos: {
          fisico: 0,
          medico: 0,
          quimico: 0,
          biologico: 0,
          ergonomico: 0,
          psicosocial: 0
        }
      });
    } catch (error) {
      console.error("Error al agregar antecedente laboral:", error);
    }
  };

  if (cargando) return <p>Cargando antecedentes laborales...</p>;

  return (
    <div>
      <table className={styles.tablaAntecedentes}>
        <thead>
          <tr>
            <th className={styles.thNormal}>Fecha</th>
            <th className={styles.thNormal}>Empresa</th>
            <th className={styles.thNormal}>Puesto</th>
            <th className={styles.thNormal}>Tiempo (meses)</th>
            <th className={styles.thNormal}>Riesgos</th>
          </tr>
        </thead>
        <tbody>
          {antecedentes.map((item) => (
            <tr key={item.antra_cod_antra}>
              <td>{new Date(item.antra_fec_antra).toLocaleDateString()}</td>
              <td>{item.antra_empr_antra}</td>
              <td>{item.antra_pue_antra}</td>
              <td>{item.antra_tie_antra}</td>
              <td>
                {Object.entries({
                  fisico: item.antra_rfi_antra,
                  medico: item.antra_rme_antra,
                  quimico: item.antra_rqui_antra,
                  biologico: item.antra_rbi_antra,
                  ergonomico: item.antra_rer_antra,
                  psicosocial: item.antra_rps_antra
                })
                  .filter(([_, value]) => value === 1)
                  .map(([key]) => key)
                  .join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.formularioLaboral}>
        <div className={styles.filaFormulario}>
          <label>Empresa:</label>
          <input
            type="text"
            value={nuevoAntecedente.empresa}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, empresa: e.target.value})}
            className={styles.input}
          />
          
          <label>Puesto:</label>
          <input
            type="text"
            value={nuevoAntecedente.puesto}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, puesto: e.target.value})}
            className={styles.input}
          />
        </div>
        
        <div className={styles.filaFormulario}>
          <label>Actividad:</label>
          <input
            type="text"
            value={nuevoAntecedente.actividad}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, actividad: e.target.value})}
            className={styles.input}
          />
          
          <label>Tiempo (meses):</label>
          <input
            type="number"
            value={nuevoAntecedente.tiempo}
            onChange={(e) => setNuevoAntecedente({...nuevoAntecedente, tiempo: e.target.value})}
            className={styles.input}
          />
        </div>
        
        <div className={styles.riesgosContainer}>
          <h4>Riesgos Laborales:</h4>
          <div className={styles.checkboxGroup}>
            {Object.keys(nuevoAntecedente.riesgos).map((riesgo) => (
              <label key={riesgo} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={nuevoAntecedente.riesgos[riesgo] === 1}
                  onChange={() => handleCheckboxChange(riesgo)}
                />
                {riesgo.charAt(0).toUpperCase() + riesgo.slice(1)}
              </label>
            ))}
          </div>
        </div>
        
        <button onClick={agregarAntecedente} className={styles.botonAgregar}>
          + Agregar
        </button>
      </div>
    </div>
  );
};

const HabitosToxicosEstiloVida = ({ pacienteId }) => {
  const [habitos, setHabitos] = useState([]);
  const [nuevoHabito, setNuevoHabito] = useState({
    detalleConsumo: '',
    tiempoConsumo: '',
    cantidadConsumo: '',
    tiempoAbstinencia: '',
    descripcionEstiloVida: '',
    tiempoPractica: ''
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarHabitos = async () => {
      try {
        const response = await api.get(`/api/v1/toxico/${pacienteId}`);
        setHabitos(response.data);
      } catch (error) {
        console.error("Error al cargar hábitos tóxicos y estilo de vida:", error);
      } finally {
        setCargando(false);
      }
    };

    if (pacienteId) cargarHabitos();
  }, [pacienteId]);

  const agregarHabito = async () => {
    if (!nuevoHabito.detalleConsumo.trim() && !nuevoHabito.descripcionEstiloVida.trim()) {
      alert("Debe ingresar al menos un hábito tóxico o estilo de vida");
      return;
    }
    
    try {
      const response = await api.post('/api/v1/toxico', {
        pacienteId,
        ...nuevoHabito
      });
      
      setHabitos([...habitos, response.data]);
      setNuevoHabito({
        detalleConsumo: '',
        tiempoConsumo: '',
        cantidadConsumo: '',
        tiempoAbstinencia: '',
        descripcionEstiloVida: '',
        tiempoPractica: ''
      });
    } catch (error) {
      console.error("Error al agregar hábito/estilo de vida:", error);
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
          </tr>
        </thead>
        <tbody>
          {habitos.map((item) => (
            <tr key={item.htev_cod_htev}>
              <td>{item.htev_dco_htev ? "Consumo" : "Estilo Vida"}</td>
              <td>{item.htev_dco_htev || item.htev_dev_htev}</td>
              <td>{item.htev_tco_htev || item.htev_tes_htev} {item.htev_tco_htev ? "meses" : "años"}</td>
              <td>{item.htev_cco_htev ? `${item.htev_cco_htev} por día/semana` : '-'}</td>
              <td>{item.htev_tab_htev ? `${item.htev_tab_htev} meses` : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.formularioHabitos}>
        <h4>Hábitos Tóxicos</h4>
        <div className={styles.filaFormulario}>
          <label>Detalle Consumo:</label>
          <input
            type="text"
            value={nuevoHabito.detalleConsumo}
            onChange={(e) => setNuevoHabito({...nuevoHabito, detalleConsumo: e.target.value})}
            placeholder="Ej: Tabaco, Alcohol, etc."
            className={styles.input}
          />
        </div>
        
        <div className={styles.filaFormulario}>
          <label>Tiempo Consumo (meses):</label>
          <input
            type="number"
            value={nuevoHabito.tiempoConsumo}
            onChange={(e) => setNuevoHabito({...nuevoHabito, tiempoConsumo: e.target.value})}
            className={styles.input}
          />
          
          <label>Cantidad Consumo:</label>
          <input
            type="text"
            value={nuevoHabito.cantidadConsumo}
            onChange={(e) => setNuevoHabito({...nuevoHabito, cantidadConsumo: e.target.value})}
            placeholder="Ej: 1 paquete/día"
            className={styles.input}
          />
        </div>
        
        <div className={styles.filaFormulario}>
          <label>Tiempo Abstinencia (meses):</label>
          <input
            type="number"
            value={nuevoHabito.tiempoAbstinencia}
            onChange={(e) => setNuevoHabito({...nuevoHabito, tiempoAbstinencia: e.target.value})}
            className={styles.input}
          />
        </div>
        
        <h4>Estilo de Vida</h4>
        <div className={styles.filaFormulario}>
          <label>Descripción:</label>
          <input
            type="text"
            value={nuevoHabito.descripcionEstiloVida}
            onChange={(e) => setNuevoHabito({...nuevoHabito, descripcionEstiloVida: e.target.value})}
            placeholder="Ej: Ejercicio, Dieta, etc."
            className={styles.input}
          />
        </div>
        
        <div className={styles.filaFormulario}>
          <label>Tiempo Practica (años):</label>
          <input
            type="number"
            value={nuevoHabito.tiempoPractica}
            onChange={(e) => setNuevoHabito({...nuevoHabito, tiempoPractica: e.target.value})}
            className={styles.input}
          />
        </div>
        
        <button onClick={agregarHabito} className={styles.botonAgregar}>
          + Agregar Registro
        </button>
      </div>
    </div>
  );
};

const AccidentesEnfermedades = ({ pacienteId }) => {
  const [registros, setRegistros] = useState([]);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    descripcion: '',
    registradoIess: false,
    detalle: ''
  });
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarRegistros = async () => {
      try {
        const response = await api.get(`/api/v1/accidentes/${pacienteId}`);
        setRegistros(response.data);
      } catch (error) {
        console.error("Error al cargar accidentes/enfermedades:", error);
      } finally {
        setCargando(false);
      }
    };

    if (pacienteId) cargarRegistros();
  }, [pacienteId]);

  const agregarRegistro = async () => {
    if (!nuevoRegistro.descripcion.trim()) return;
    
    try {
      const response = await api.post('/api/v1/accidentes', {
        pacienteId,
        ...nuevoRegistro
      });
      
      setRegistros([...registros, response.data]);
      setNuevoRegistro({
        descripcion: '',
        registradoIess: false,
        detalle: ''
      });
    } catch (error) {
      console.error("Error al agregar accidente/enfermedad:", error);
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
          </tr>
        </thead>
        <tbody>
          {registros.map((item) => (
            <tr key={item.accep_cod_accep}>
              <td>{item.accep_des_accep}</td>
              <td>{item.accep_iess_accep ? 'Sí' : 'No'}</td>
              <td>{item.accep_dae_accep || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.agregarFila}>
        <input
          type="text"
          value={nuevoRegistro.descripcion}
          onChange={(e) => setNuevoRegistro({...nuevoRegistro, descripcion: e.target.value})}
          placeholder="Descripción"
          className={styles.input}
        />
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={nuevoRegistro.registradoIess}
            onChange={(e) => setNuevoRegistro({...nuevoRegistro, registradoIess: e.target.checked})}
          />
          Registrado IESS
        </label>
        <button onClick={agregarRegistro} className={styles.botonAgregar}>
          +
        </button>
      </div>
    </div>
  );
};

const ActividadesExtralaborales = ({ pacienteId }) => {
  const [actividades, setActividades] = useState([]);
  const [nuevaActividad, setNuevaActividad] = useState('');
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const cargarActividades = async () => {
      try {
        const response = await api.get(`/api/v1/extralaborales/${pacienteId}`);
        setActividades(response.data);
      } catch (error) {
        console.error("Error al cargar actividades extralaborales:", error);
      } finally {
        setCargando(false);
      }
    };

    if (pacienteId) cargarActividades();
  }, [pacienteId]);

  const agregarActividad = async () => {
    if (!nuevaActividad.trim()) return;
    
    try {
      const response = await api.post('/api/v1/extralaborales', {
        pacienteId,
        descripcion: nuevaActividad
      });
      
      setActividades([...actividades, response.data]);
      setNuevaActividad('');
    } catch (error) {
      console.error("Error al agregar actividad extralaboral:", error);
    }
  };

  if (cargando) return <p>Cargando actividades extralaborales...</p>;

  return (
    <div>
      <table className={styles.tablaAntecedentes}>
        <thead>
          <tr>
            <th className={styles.thNormal}>Descripción</th>
          </tr>
        </thead>
        <tbody>
          {actividades.map((item) => (
            <tr key={item.aexla_cod_aexla}>
              <td>{item.aexla_des_aexla}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      <div className={styles.agregarFila}>
        <input
          type="text"
          value={nuevaActividad}
          onChange={(e) => setNuevaActividad(e.target.value)}
          placeholder="Nueva actividad"
          className={styles.input}
        />
        <button onClick={agregarActividad} className={styles.botonAgregar}>
          +
        </button>
      </div>
    </div>
  );
};

const HistoriaClinica = () => {
  const [pacienteId, setPacienteId] = useState("");
  const [especialidad, setEspecialidad] = useState("Todas");
  const [atenciones, setAtenciones] = useState([]);
  const [totalAtenciones, setTotalAtenciones] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [error, setError] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [mostrarEspecialidad, setMostrarEspecialidad] = useState(false);

  const buscarPacientes = async (query) => {
    if (!query) {
      setResultadosBusqueda([]);
      return;
    }

    try {
      const response = await api.get(`/api/v1/pacientes?search=${query}`);
      setResultadosBusqueda(response.data.pacientes);
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
    }
  };

  useEffect(() => {
    buscarPacientes(busqueda);
  }, [busqueda]);

  const seleccionarPaciente = (paciente) => {
    setPacienteId(paciente.pacie_cod_pacie);
    setBusqueda(`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`);
    setResultadosBusqueda([]);
  };

  const buscarAtenciones = async (pagina = paginaActual) => {
    setError("");
    setAtenciones([]);
    setTotalAtenciones(0);
    setPaciente(null);

    if (!pacienteId) {
      setError("Por favor, selecciona un paciente.");
      return;
    }

    try {
      const pacienteResponse = await api.get(`/api/v1/pacientes/${pacienteId}`);
      setPaciente(pacienteResponse.data);

      const offset = (pagina - 1) * registrosPorPagina;
      const atencionesResponse = await api.get(
        `/api/v1/atenciones/paciente/${pacienteId}/especialidad/${especialidad}`,
        {
          params: {
            limit: registrosPorPagina,
            offset,
          },
        }
      );
      setAtenciones(atencionesResponse.data.atenciones);
      setTotalAtenciones(atencionesResponse.data.total);
      setMostrarEspecialidad(especialidad === "Todas");
      setBusqueda("");
    } catch (err) {
      setError("No se encontraron atenciones para el paciente y especialidad seleccionados.");
      console.error("Error al buscar atenciones:", err);
    }
  };

  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina);
    buscarAtenciones(nuevaPagina);
  };

  const cambiarRegistrosPorPagina = (e) => {
    const nuevoRegistrosPorPagina = parseInt(e.target.value, 10);
    setRegistrosPorPagina(nuevoRegistrosPorPagina);
    setPaginaActual(1);
    buscarAtenciones(1);
  };

  useEffect(() => {
    if (pacienteId) {
      buscarAtenciones();
    }
  }, [registrosPorPagina]);

  const tabs = [
    { 
      id: "personales", 
      label: "Personales", 
      content: <AntecedentesPersonales pacienteId={pacienteId} /> 
    },
    { 
      id: "gineco", 
      label: "Gineco-Obstétricos", 
      content: <AntecedentesGinecoObstetricos pacienteId={pacienteId} /> 
    },
    { 
      id: "laborales", 
      label: "Laborales", 
      content: <AntecedentesLaborales pacienteId={pacienteId} /> 
    },
    { 
      id: "habitos", 
      label: "Hábitos Tóxicos/Estilo Vida", 
      content: <HabitosToxicosEstiloVida pacienteId={pacienteId} /> 
    },
    { 
      id: "accidentes", 
      label: "Accidentes/Enfermedades", 
      content: <AccidentesEnfermedades pacienteId={pacienteId} /> 
    },
    { 
      id: "extralaborales", 
      label: "Extralaborales", 
      content: <ActividadesExtralaborales pacienteId={pacienteId} /> 
    },
  ];

  return (
    <div className={styles.historiaClinicaContainer}>
      <form onSubmit={(e) => { e.preventDefault(); buscarAtenciones(); }} className={styles.form}>
        <div className={styles.filaBusqueda}>
          <input
            type="text"
            placeholder="Buscar por cédula o apellido"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className={styles.input}
          />
          <select
            value={especialidad}
            onChange={(e) => setEspecialidad(e.target.value)}
            className={styles.select}
          >
            {especialidades.map((esp) => (
              <option key={esp} value={esp}>
                {esp}
              </option>
            ))}
          </select>
          <button type="submit" className={styles.button}>Buscar</button>
        </div>

        {resultadosBusqueda.length > 0 && (
          <table className={styles.tablaResultados}>
            <thead>
              <tr>
                <th className={styles.thNormal}>Cédula</th>
                <th className={styles.thNormal}>Nombre</th>
              </tr>
            </thead>
            <tbody>
              {resultadosBusqueda.map((paciente) => (
                <tr
                  key={paciente.pacie_cod_pacie}
                  onClick={() => seleccionarPaciente(paciente)}
                  className={styles.filaResultado}
                >
                  <td>{paciente.pacie_ced_pacie}</td>
                  <td>{paciente.pacie_nom_pacie} {paciente.pacie_ape_pacie}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </form>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {paciente && (
        <div className={styles.pacienteInfo}>
          <table className={styles.tablaPaciente}>
            <tbody>
              <tr>
                <td><strong>Nombre:</strong></td>
                <td>{paciente.pacie_nom_pacie} {paciente.pacie_ape_pacie}</td>
              </tr>
              <tr>
                <td><strong>Cédula:</strong></td>
                <td>{paciente.pacie_ced_pacie}</td>
                <td><strong>Sexo:</strong></td>
                <td>{paciente.sexo_nom_sexo}</td>
              </tr>
              <tr>
                <td><strong>Fecha de Nacimiento:</strong></td>
                <td>{new Date(paciente.pacie_fec_nac).toLocaleDateString()}</td>
                <td><strong>Edad:</strong></td>
                <td>{calcularEdad(paciente.pacie_fec_nac)} años</td>
              </tr>
              <tr>
                <td><strong>Dirección:</strong></td>
                <td colSpan="3">{paciente.pacie_dir_pacie}</td>
              </tr>
            </tbody>
          </table>

          <HorizontalTabs tabs={tabs} />
        </div>
      )}

      {atenciones.length > 0 && (
        <>
          <AtencionList
            atenciones={atenciones}
            mostrarEspecialidad={mostrarEspecialidad}
          />
          <div className={styles.paginacion}>
            <select
              value={registrosPorPagina}
              onChange={cambiarRegistrosPorPagina}
              className={styles.select}
            >
              {opcionesRegistros.map((opcion) => (
                <option key={opcion} value={opcion}>
                  Mostrar {opcion} registros
                </option>
              ))}
            </select>
            <button
              onClick={() => cambiarPagina(paginaActual - 1)}
              disabled={paginaActual === 1}
              className={styles.button}
            >
              Anterior
            </button>
            <span>Página {paginaActual} de {Math.ceil(totalAtenciones / registrosPorPagina)}</span>
            <button
              onClick={() => cambiarPagina(paginaActual + 1)}
              disabled={paginaActual === Math.ceil(totalAtenciones / registrosPorPagina)}
              className={styles.button}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </div>
  );
};

HorizontalTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
};

export default HistoriaClinica;