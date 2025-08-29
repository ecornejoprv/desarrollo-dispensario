// ==============================================================================
// @file: HistoriaClinica.jsx
// @summary: Componente principal para la visualización de la historia clínica
//           de un paciente. Permite buscar pacientes y ver sus atenciones
//           médicas y antecedentes.
// @version: 2.0.0
// ==============================================================================

// --- IMPORTACIONES DE LIBRERÍAS Y HOOKS ---
import { useState, useEffect } from "react"; // Se importan los hooks 'useState' y 'useEffect' de React.
import { useDebounce } from "../hooks/useDebounce"; // Hook personalizado para retrasar la ejecución de una función (en este caso, la búsqueda).
import PropTypes from "prop-types"; // Se importa para la validación de las props de los componentes.

// --- IMPORTACIONES DE COMPONENTES Y UTILIDADES PROPIAS ---
import api from "../api"; // Instancia de Axios configurada para las llamadas a la API.
import AtencionList from "../components/AtencionList"; // Componente hijo que renderiza la lista de atenciones.
import styles from "./styles/historia.module.css"; // Estilos modulares para este componente.
import { formatDateDDMMYYYY } from "../components/utils/formatters.js"; // Función para formatear fechas.
import AntecedentesCompletos from "../components/Antecedentes"; // Componente hijo que muestra los antecedentes.

// --- DATOS CONSTANTES ---
// Array con las especialidades disponibles para el filtro.
const especialidades = [ "Todas", "Medicina", "Odontologia", "Fisioterapia", "Enfermeria" ];
// Array con las opciones para el selector de cuántos registros mostrar por página.
const opcionesRegistros = [10, 20, 50, 100];

// --- FUNCIÓN UTILITARIA ---
// Calcula la edad de una persona a partir de su fecha de nacimiento.
const calcularEdad = (fechaNacimiento) => {
  const hoy = new Date(); // Se obtiene la fecha actual.
  const nacimiento = new Date(fechaNacimiento); // Se convierte la fecha de nacimiento a un objeto Date.
  let edad = hoy.getFullYear() - nacimiento.getFullYear(); // Se calcula la diferencia de años.
  const mes = hoy.getMonth() - nacimiento.getMonth(); // Se calcula la diferencia de meses.

  // Se ajusta la edad si aún no ha cumplido años en el año actual.
  if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
    edad--; // Se resta un año.
  }

  return edad; // Se devuelve la edad calculada.
};

// --- COMPONENTE INTERNO PARA PESTAÑAS (TABS) ---
// Este componente no se usa actualmente en HistoriaClinica, pero está definido.
const HorizontalTabs = ({ tabs }) => {
  const [activeTab, setActiveTab] = useState(tabs[0].id); // Estado para saber qué pestaña está activa.

  return (
    <div className={styles.horizontalTabsContainer}>
      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`${styles.tabButton} ${ activeTab === tab.id ? styles.active : "" }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className={styles.tabsContent}>
        {tabs.map(
          (tab) =>
            activeTab === tab.id && (
              <div key={tab.id} className={styles.tabContent}>
                {tab.content}
              </div>
            )
        )}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL: HistoriaClinica ---
const HistoriaClinica = () => {
  // --- DEFINICIÓN DE ESTADOS ---
  const [pacienteId, setPacienteId] = useState(""); // Almacena el ID del paciente seleccionado para la búsqueda de atenciones.
  const [especialidad, setEspecialidad] = useState("Todas"); // Almacena la especialidad seleccionada en el filtro.
  const [atenciones, setAtenciones] = useState([]); // Almacena la lista de atenciones del paciente.
  const [datosEmpleado, setDatosEmpleado] = useState({ // Almacena los datos laborales del paciente.
    departamento: "No disponible",
    seccion: "No disponible",
    cargo: "No disponible",
    fechaIngreso: null,
  });
  const [totalAtenciones, setTotalAtenciones] = useState(0); // Almacena el número total de atenciones para la paginación.
  const [paginaActual, setPaginaActual] = useState(1); // Controla la página actual de la lista de atenciones.
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10); // Controla cuántos registros se muestran por página.
  const [error, setError] = useState(""); // Almacena mensajes de error para mostrarlos al usuario.
  const [paciente, setPaciente] = useState(null); // Almacena el objeto completo del paciente seleccionado.
  const [busqueda, setBusqueda] = useState(""); // Almacena el texto que el usuario escribe en el campo de búsqueda.
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]); // Almacena los resultados de la búsqueda de pacientes.
  const [mostrarEspecialidad, setMostrarEspecialidad] = useState(false); // Flag para mostrar u ocultar la columna de especialidad.
  const debouncedBusqueda = useDebounce(busqueda, 500); // Valor de 'busqueda' pero con un retraso de 500ms para no saturar la API.

  // --- FUNCIONES ---
  // Función asíncrona para buscar pacientes en la API.
  const buscarPacientes = async (query) => {
    // Si el campo de búsqueda está vacío, limpia los resultados.
    if (!query) {
      setResultadosBusqueda([]);
      return;
    }
    try {
      // Realiza la petición GET a la API para buscar pacientes.
      const response = await api.get(`/api/v1/pacientes?search=${query}`);
      // Actualiza el estado con la lista de pacientes encontrados.
      setResultadosBusqueda(response.data.pacientes);
    } catch (error) {
      // En caso de error, lo muestra en la consola.
      console.error("Error al buscar pacientes:", error);
    }
  };

  // Hook 'useEffect' para ejecutar la búsqueda de pacientes cuando el valor 'debouncedBusqueda' cambia.
  useEffect(() => {
    buscarPacientes(debouncedBusqueda);
  }, [debouncedBusqueda]);

  // Función asíncrona para obtener los datos laborales de un paciente.
  const obtenerDatosEmpleado = async () => {
    // Si no hay un paciente seleccionado, no hace nada.
    if (!paciente?.pacie_ced_pacie) return;
    try {
      // Realiza la petición a la API para obtener los datos del empleado.
      const response = await api.get(
        `/api/v1/empleados/${paciente.pacie_ced_pacie}/empresa/${paciente.pacie_cod_empr}`
      );
      // Actualiza el estado con los datos laborales obtenidos.
      setDatosEmpleado({
        departamento: response.data.departamento || "No disponible",
        seccion: response.data.seccion || "No disponible",
        cargo: response.data.cargo || "No disponible",
        fechaIngreso: response.data.fechaIngreso || null,
      });
    } catch (error) {
      // En caso de error, lo muestra en consola y resetea el estado a valores por defecto.
      console.error("Error al obtener datos del empleado:", error);
      setDatosEmpleado({
        departamento: "No disponible",
        seccion: "No disponible",
        cargo: "No disponible",
        fechaIngreso: null,
      });
    }
  };

  // Hook 'useEffect' que se dispara cuando el estado 'paciente' cambia para obtener sus datos laborales.
  useEffect(() => {
    if (paciente) {
      obtenerDatosEmpleado();
    }
  }, [paciente]);

  // Función que se ejecuta cuando el usuario selecciona un paciente de la lista de resultados.
  const seleccionarPaciente = (paciente) => {
    setPacienteId(paciente.pacie_cod_pacie); // Guarda el ID del paciente.
    setBusqueda(`${paciente.pacie_nom_pacie} ${paciente.pacie_ape_pacie}`); // Pone el nombre completo en el input de búsqueda.
    setResultadosBusqueda([]); // Limpia la lista de resultados de búsqueda.
  };

  // Función asíncrona principal para buscar las atenciones de un paciente.
  const buscarAtenciones = async (pagina = paginaActual) => {
    // Resetea los estados antes de cada búsqueda.
    setError("");
    setAtenciones([]);
    setTotalAtenciones(0);
    setPaciente(null);

    // Si no hay un ID de paciente, muestra un error y no continúa.
    if (!pacienteId) {
      setError("Por favor, selecciona un paciente.");
      return;
    }

    try {
      // Obtiene los datos completos del paciente.
      const pacienteResponse = await api.get(`/api/v1/pacientes/${pacienteId}`);
      // Actualiza el estado del paciente.
      setPaciente(pacienteResponse.data);

      // Calcula el 'offset' para la paginación de la base de datos.
      const offset = (pagina - 1) * registrosPorPagina;
      // Realiza la petición para obtener las atenciones del paciente.
      const atencionesResponse = await api.get(
        `/api/v1/atenciones/paciente/${pacienteId}/especialidad/${especialidad}`,
        {
          params: {
            limit: registrosPorPagina,
            offset,
          },
        }
      );
      // Actualiza el estado con la lista de atenciones.
      setAtenciones(atencionesResponse.data.atenciones);
      // Actualiza el estado con el total de atenciones para la paginación.
      setTotalAtenciones(atencionesResponse.data.total);
      // Define si se debe mostrar la columna de especialidad (solo si se seleccionó "Todas").
      setMostrarEspecialidad(especialidad === "Todas");
      // Limpia el input de búsqueda.
      setBusqueda("");
    } catch (err) {
      // En caso de error, establece un mensaje para el usuario.
      setError("No se encontraron atenciones para el paciente y especialidad seleccionados.");
      console.error("Error al buscar atenciones:", err);
    }
  };

  // Función para cambiar de página en la lista de atenciones.
  const cambiarPagina = (nuevaPagina) => {
    setPaginaActual(nuevaPagina); // Actualiza el estado de la página actual.
    buscarAtenciones(nuevaPagina); // Llama a buscar atenciones para la nueva página.
  };

  // Función que se ejecuta cuando el usuario cambia el número de registros por página.
  const cambiarRegistrosPorPagina = (e) => {
    const nuevoRegistrosPorPagina = parseInt(e.target.value, 10);
    setRegistrosPorPagina(nuevoRegistrosPorPagina);
    setPaginaActual(1); // Resetea a la primera página.
    buscarAtenciones(1); // Busca las atenciones con la nueva configuración.
  };

  // Hook 'useEffect' que vuelve a buscar atenciones si el número de registros por página cambia.
  useEffect(() => {
    if (pacienteId) {
      buscarAtenciones();
    }
  }, [registrosPorPagina]);

  // --- RENDERIZADO DEL COMPONENTE ---
  return (
    <div className={styles.historiaClinicaContainer}>
      {/* Formulario de búsqueda */}
      <form
        onSubmit={(e) => {
          e.preventDefault(); // Previene el comportamiento por defecto del formulario.
          buscarAtenciones(); // Llama a la función de búsqueda.
        }}
        className={styles.form}
      >
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
          <button type="submit" className={styles.button}>
            Buscar
          </button>
        </div>

        {/* Tabla de resultados de la búsqueda de pacientes */}
        {resultadosBusqueda.length > 0 && (
          <div className={styles.resultadosContainer}>
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
                    <td>{paciente.pacie_ape_pacie} {paciente.pacie_nom_pacie}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>

      {/* Muestra un mensaje de error si existe */}
      {error && <p className={styles.errorMessage}>{error}</p>}

      {/* Muestra la información del paciente si se ha seleccionado uno */}
      {paciente && (
        <div className={styles.pacienteInfo}>
          <table className={styles.tablaPaciente}>
            <tbody>
              <tr><td><strong>Nombre:</strong></td><td>{paciente.pacie_ape_pacie} {paciente.pacie_nom_pacie}</td></tr>
              <tr><td><strong>Cédula:</strong></td><td>{paciente.pacie_ced_pacie}</td><td><strong>Sexo:</strong></td><td>{paciente.sexo_nom_sexo}</td></tr>
              <tr><td><strong>Fecha de Nacimiento:</strong></td><td>{formatDateDDMMYYYY(paciente.pacie_fec_nac)}</td><td><strong>Edad:</strong></td><td>{calcularEdad(paciente.pacie_fec_nac)} años</td></tr>
              <tr><td><strong>Dirección:</strong></td><td colSpan="3">{paciente.pacie_dir_pacie}</td></tr>
              <tr><td><strong>Departamento:</strong></td><td colSpan="3">{datosEmpleado?.departamento || "No disponible"}</td></tr>
              <tr><td><strong>Sección:</strong></td><td colSpan="3">{datosEmpleado?.seccion || "No disponible"}</td></tr>
              <tr><td><strong>Cargo:</strong></td><td colSpan="3">{datosEmpleado?.cargo || "No disponible"}</td></tr>
              <tr><td><strong>Fecha Ingreso:</strong></td><td colSpan="3">{datosEmpleado?.fechaIngreso ? formatDateDDMMYYYY(datosEmpleado.fechaIngreso) : "No disponible"}</td></tr>
            </tbody>
          </table>
        </div>
      )}
      
      {/* Muestra los antecedentes del paciente */}
      {paciente && (
        <div className={styles.my8}>
          <AntecedentesCompletos pacienteId={paciente.pacie_cod_pacie} sexo={paciente.pacie_cod_sexo} />
        </div>
      )}
      
      {/* Muestra la lista de atenciones si existen */}
      {atenciones.length > 0 && (
        <>
          <AtencionList
            atenciones={atenciones}
            mostrarEspecialidad={mostrarEspecialidad}
          />
          {/* Controles de paginación */}
          <div className={styles.paginacion}>
            <select
              value={registrosPorPagina}
              onChange={cambiarRegistrosPorPagina}
              className={styles.selectPaginacion}
            >
              {opcionesRegistros.map((opcion) => (
                <option key={opcion} value={opcion}>Mostrar {opcion} registros</option>
              ))}
            </select>

            <div className={styles.navegacionControles}>
              <button onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual === 1} className={styles.buttonPaginacion}>Anterior</button>
              <span className={styles.textoPagina}>Página {paginaActual} de {Math.ceil(totalAtenciones / registrosPorPagina)}</span>
              <button onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual === Math.ceil(totalAtenciones / registrosPorPagina)} className={`${styles.buttonPaginacion} ${styles.buttonSiguiente}`}>Siguiente</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// --- VALIDACIÓN DE PROPS ---
// Se definen los tipos esperados para las props del componente HorizontalTabs.
HorizontalTabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
};

// --- EXPORTACIÓN DEL COMPONENTE ---
export default HistoriaClinica;