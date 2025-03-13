import PropTypes from "prop-types";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      sx={{
        "& .MuiDialog-paper": {
          backgroundColor: "#f0f4f8",
          padding: "15px",
          borderRadius: "10px",
          maxWidth: "10000px",
          width: "95%",
        },
        "& .MuiDialogTitle-root": {
          fontSize: "1.2rem",
          fontWeight: "bold",
          color: "#2c3e50",
          padding: "8px 15px",
        },
        "& .MuiDialogContent-root": {
          padding: "15px",
        },
        "& .MuiDialogActions-root": {
          padding: "10px 15px",
          justifyContent: "flex-end",
        },
        "& .MuiButton-root": {
          backgroundColor: "#007bff",
          color: "white",
          fontSize: "0.75rem",
          padding: "4px 8px",
          minWidth: "auto",
          "&:hover": {
            backgroundColor: "#0056b3",
          },
        },
        "& .procedimiento-table": {
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "15px",
        },
        "& .procedimiento-table th, & .procedimiento-table td": {
          border: "1px solid black",
          padding: "6px",
          fontSize: "0.875rem",
        },
        "& .procedimiento-table th": {
          backgroundColor: "#e0e0e0",
        },
        "& .procedimiento-table th:nth-of-type(1), & .procedimiento-table td:nth-of-type(1)": {
          width: "5%",
        },
        "& .procedimiento-table th:nth-of-type(2), & .procedimiento-table td:nth-of-type(2)": {
          width: "45%",
        },
        "& .procedimiento-table th:nth-of-type(3), & .procedimiento-table td:nth-of-type(3)": {
          width: "50%",
        },
        "& .details-section": {
          color: "#2c3e50",
          fontFamily: "'Roboto', sans-serif",
          lineHeight: "1.4",
          fontSize: "0.875rem",
        },
        "& .details-section p": {
          margin: "4px 0",
        },
        "& .details-section strong": {
          color: "#007bff",
        },
        "& .details-section h4": {
          marginTop: "15px",
          fontSize: "1rem",
          color: "#007bff",
          textAlign: "center",
        },
        "& .details-section ul": {
          listStyleType: "none",
          padding: "0",
        },
        "& .details-section li": {
          marginBottom: "8px",
        },
        "& .separator": {
          borderTop: "1px solid #ccc",
          margin: "15px 0",
        },
        "& .diagnostico-item": {
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "8px",
        },
        "& .cabeceraprocedimiento-table td:nth-of-type(1)": {
          width: "8%",
        },
        "& .cabeceraprocedimiento-table td:nth-of-type(2)": {
          width: "80%",
        },
        "& .cabeceraprocedimiento-table td:nth-of-type(3)": {
          width: "12%",
        },
        "& .tabla-atenciones th, & .tabla-atenciones td": {
          padding: "6px",
          fontSize: "0.875rem",
        },
        "& .diagnostico": {
          width: "30%",
        },
        "& .cie10": {
          width: "20%",
        },
        "& .estado": {
          width: "20%",
        },
        "& .observacion": {
          width: "100%",
        },
      }}
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cerrar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

export default Modal;