import { useState, useEffect } from "react";
import PropTypes from 'prop-types';
import api from "../api";
import AtencionList from "../components/AtencionList";
import styles from "./styles/historia.module.css";

const especialidades = ["Todas", "Medicina", "Odontologia", "Fisioterapia", "Enfermeria"];
const opcionesRegistros = [10, 20, 50, 100];

// Función para calcular la edad a partir de la fecha de nacimiento
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

// Componente de pestañas horizontales
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

const HistoriaClinica = () => {
  const [pacienteId, setPacienteId] = useState("");
  const [especialidad, setEspecialidad] = useState("Todas");
  const [atenciones, setAtenciones] = useState([]);
  const [totalAtenciones, setTotalAtenciones] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [error, setError] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [busqueda, setBusqueda] = useState(""); // Estado para el campo de búsqueda
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]); // Estado para los resultados de la búsqueda
  const [mostrarEspecialidad, setMostrarEspecialidad] = useState(false); // Estado para controlar si se muestra la columna de especialidad

  // Función para buscar pacientes por cédula o apellido
  const buscarPacientes = async (query) => {
    if (!query) {
      setResultadosBusqueda([]); // Limpiar resultados si la búsqueda está vacía
      return;
    }

    try {
      const response = await api.get(`/api/v1/pacientes?search=${query}`);
      setResultadosBusqueda(response.data.pacientes);
    } catch (error) {
      console.error("Error al buscar pacientes:", error);
    }
  };

  // Efecto para realizar la búsqueda en tiempo real
  useEffect(() => {
    buscarPacientes(busqueda);
  }, [busqueda]);

  // Función para seleccionar un paciente de los resultados de búsqueda
  const seleccionarPaciente = (paciente) => {
    setPacienteId(paciente.pacie_cod_pacie); // Establecer el ID del paciente seleccionado
    setBusqueda(`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`); // Mostrar el nombre completo en el campo de búsqueda
    setResultadosBusqueda([]); // Limpiar los resultados de búsqueda
  };

  // Función para buscar atenciones y datos del paciente
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
      // Obtener los datos del paciente
      const pacienteResponse = await api.get(`/api/v1/pacientes/${pacienteId}`);
      setPaciente(pacienteResponse.data);

      // Obtener las atenciones del paciente
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

      // Actualizar si se debe mostrar la columna de especialidad
      setMostrarEspecialidad(especialidad === "Todas");

      // Vaciar el campo de búsqueda después de la búsqueda
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
    setPaginaActual(1); // Reiniciar a la página 1
    buscarAtenciones(1); // Realizar una nueva búsqueda con el nuevo número de registros por página
  };

  // Efecto para realizar la búsqueda de atenciones cuando cambia el número de registros por página
  useEffect(() => {
    if (pacienteId) {
      buscarAtenciones();
    }
  }, [registrosPorPagina]);

  // Definir las pestañas
  const tabs = [
    { id: "antecedentes", label: "Antecedentes", content: <p>Contenido de antecedentes...</p> },
    { id: "antecedentesFamiliares", label: "Antecedentes Familiares", content: <p>Contenido de antecedentes familiares...</p> },
    { id: "habitos", label: "Hábitos", content: <p>Contenido de hábitos...</p> },
  ];

  return (
    <div className={styles.historiaClinicaContainer}>
      <form onSubmit={(e) => { e.preventDefault(); buscarAtenciones(); }} className={styles.form}>
        {/* Campo de búsqueda, selector de especialidad y botón en una sola fila */}
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

        {/* Mostrar resultados de la búsqueda en una tabla */}
        {resultadosBusqueda.length > 0 && (
          <table className={styles.tablaResultados}>
            <thead>
              <tr>
                <th>Cédula</th>
                <th>Nombre</th>
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

          {/* Pestañas horizontales para antecedentes, antecedentes familiares y hábitos */}
          <HorizontalTabs tabs={tabs} />
        </div>
      )}

      {atenciones.length > 0 && (
        <>
          <AtencionList
            atenciones={atenciones}
            mostrarEspecialidad={mostrarEspecialidad} // Pasar el estado de mostrarEspecialidad
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