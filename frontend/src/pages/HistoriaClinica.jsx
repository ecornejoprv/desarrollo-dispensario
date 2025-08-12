import { useState, useEffect } from "react";
import { useDebounce } from "../hooks/useDebounce";
import PropTypes from "prop-types";
import api from "../api";
import AtencionList from "../components/AtencionList";
import styles from "./styles/historia.module.css";
import { formatDateDDMMYYYY } from "../components/utils/formatters.js";
import AntecedentesCompletos from "../components/Antecedentes";

const especialidades = [
  "Todas",
  "Medicina",
  "Odontologia",
  "Fisioterapia",
  "Enfermeria",
];
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
            className={`${styles.tabButton} ${
              activeTab === tab.id ? styles.active : ""
            }`}
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

const HistoriaClinica = () => {
  const [pacienteId, setPacienteId] = useState("");
  const [especialidad, setEspecialidad] = useState("Todas");
  const [atenciones, setAtenciones] = useState([]);
  const [datosEmpleado, setDatosEmpleado] = useState({
    departamento: "No disponible",
    seccion: "No disponible",
    cargo: "No disponible",
    fechaIngreso: null,
  });
  const [totalAtenciones, setTotalAtenciones] = useState(0);
  const [paginaActual, setPaginaActual] = useState(1);
  const [registrosPorPagina, setRegistrosPorPagina] = useState(10);
  const [error, setError] = useState("");
  const [paciente, setPaciente] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [resultadosBusqueda, setResultadosBusqueda] = useState([]);
  const [mostrarEspecialidad, setMostrarEspecialidad] = useState(false);
  const debouncedBusqueda = useDebounce(busqueda, 100);

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
  }, [debouncedBusqueda]);

  const obtenerDatosEmpleado = async () => {
    if (!paciente?.pacie_ced_pacie) return;

    try {
      const response = await api.get(
        `/api/v1/empleados/${paciente.pacie_ced_pacie}/empresa/${paciente.pacie_cod_empr}`
      );
      setDatosEmpleado({
        departamento: response.data.departamento || "No disponible",
        seccion: response.data.seccion || "No disponible",
        cargo: response.data.cargo || "No disponible",
        fechaIngreso: response.data.fechaIngreso || null,
      });
    } catch (error) {
      console.error("Error al obtener datos del empleado:", error);
      setDatosEmpleado({
        departamento: "No disponible",
        seccion: "No disponible",
        cargo: "No disponible",
        fechaIngreso: null,
      });
    }
  };

  useEffect(() => {
    if (paciente) {
      obtenerDatosEmpleado();
    }
  }, [paciente]);

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
      setError(
        "No se encontraron atenciones para el paciente y especialidad seleccionados."
      );
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

  return (
    <div className={styles.historiaClinicaContainer}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          buscarAtenciones();
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

        {resultadosBusqueda.length > 0 && (
          <div className={styles.resultadosContainer}>
            {" "}
            {/* <-- Contenedor añadido */}
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
                    <td>
                      {paciente.pacie_ape_pacie} {paciente.pacie_nom_pacie}{" "}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </form>

      {error && <p className={styles.errorMessage}>{error}</p>}

      {paciente && (
        <div className={styles.pacienteInfo}>
          <table className={styles.tablaPaciente}>
            <tbody>
              <tr>
                <td>
                  <strong>Nombre:</strong>
                </td>
                <td>
                  {paciente.pacie_ape_pacie} {paciente.pacie_nom_pacie}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Cédula:</strong>
                </td>
                <td>{paciente.pacie_ced_pacie}</td>
                <td>
                  <strong>Sexo:</strong>
                </td>
                <td>{paciente.sexo_nom_sexo}</td>
              </tr>
              <tr>
                <td>
                  <strong>Fecha de Nacimiento:</strong>
                </td>
                <td>{formatDateDDMMYYYY(paciente.pacie_fec_nac)}</td>
                <td>
                  <strong>Edad:</strong>
                </td>
                <td>{calcularEdad(paciente.pacie_fec_nac)} años</td>
              </tr>
              <tr>
                <td>
                  <strong>Dirección:</strong>
                </td>
                <td colSpan="3">{paciente.pacie_dir_pacie}</td>
              </tr>
              <tr>
                <td>
                  <strong>Departamento:</strong>
                </td>
                <td colSpan="3">
                  {datosEmpleado?.departamento || "No disponible"}
                </td>
              </tr>
              <tr>
                <td>
                  <strong>Sección:</strong>
                </td>
                <td colSpan="3">{datosEmpleado?.seccion || "No disponible"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Cargo:</strong>
                </td>
                <td colSpan="3">{datosEmpleado?.cargo || "No disponible"}</td>
              </tr>
              <tr>
                <td>
                  <strong>Fecha Ingreso:</strong>
                </td>
                <td colSpan="3">
                  {datosEmpleado?.fechaIngreso
                    ? formatDateDDMMYYYY(datosEmpleado.fechaIngreso)
                    : "No disponible"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {paciente && (
        <div className={styles.my8}>
          <AntecedentesCompletos
            pacienteId={paciente.pacie_cod_pacie}
            sexo={paciente.pacie_cod_sexo}
          />
        </div>
      )}
      {atenciones.length > 0 && (
        <>
          <AtencionList
            atenciones={atenciones}
            mostrarEspecialidad={mostrarEspecialidad}
          />
          {/* Contenedor principal de la paginación */}
          <div className={styles.paginacion}>
            {/* Elemento izquierdo: Selector de registros por página */}
            <select
              value={registrosPorPagina}
              onChange={cambiarRegistrosPorPagina}
              className={styles.selectPaginacion} // Usaremos una clase potencialmente más específica o ajustaremos styles.select
            >
              {opcionesRegistros.map((opcion) => (
                <option key={opcion} value={opcion}>
                  Mostrar {opcion} registros
                </option>
              ))}
            </select>

            {/* Nuevo contenedor para los controles de navegación de la derecha */}
            <div className={styles.navegacionControles}>
              <button
                onClick={() => cambiarPagina(paginaActual - 1)}
                disabled={paginaActual === 1}
                className={styles.buttonPaginacion} // Clase para estilo de botón de paginación
              >
                Anterior
              </button>
              <span className={styles.textoPagina}>
                {" "}
                {/* Clase para el texto de la página */}
                Página {paginaActual} de{" "}
                {Math.ceil(totalAtenciones / registrosPorPagina)}
              </span>
              <button
                onClick={() => cambiarPagina(paginaActual + 1)}
                disabled={
                  paginaActual ===
                  Math.ceil(totalAtenciones / registrosPorPagina)
                }
                // Aplicamos la clase base y una específica para el botón "Siguiente" para el estilo azul
                className={`${styles.buttonPaginacion} ${styles.buttonSiguiente}`}
              >
                Siguiente
              </button>
            </div>
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
