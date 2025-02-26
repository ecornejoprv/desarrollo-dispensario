import PropTypes from "prop-types"; // Importar PropTypes
import Modal from "react-modal";
import "./styles/SessionExpiredModal.css"; // Importar el archivo de estilos

// Vincular el modal al elemento raíz de la aplicación
Modal.setAppElement("#root");

export default function SessionExpiredModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        content: {
          top: "50%",
          left: "50%",
          right: "auto",
          bottom: "auto",
          transform: "translate(-50%, -50%)",
          width: "300px",
          padding: "20px",
          borderRadius: "10px",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          border: "none",
          textAlign: "center",
          backgroundColor: "#ffffff",
        },
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        },
      }}
      contentLabel="Sesión expirada"
    >
      <h2 className="modal-title">Tu sesión ha expirado</h2>
      <p className="modal-message">Por favor, inicia sesión nuevamente.</p>
      <button className="modal-button" onClick={onClose}>
        Cerrar
      </button>
    </Modal>
  );
}

// Validación de props
SessionExpiredModal.propTypes = {
  isOpen: PropTypes.bool.isRequired, // isOpen debe ser un booleano y es requerido
  onClose: PropTypes.func.isRequired, // onClose debe ser una función y es requerido
};