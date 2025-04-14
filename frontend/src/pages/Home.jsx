import { useState } from "react";
import api from "../api";

export default function Home() {
  // Estilos como objetos JavaScript
  const styles = {
    home: {
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333",
      backgroundColor: "#f5f7fa",
      minHeight: "100vh",
      padding: "20px"
    },
    container: {
      maxWidth: "1200px",
      margin: "0 auto"
    },
    homeHeader: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "40px",
      backgroundColor: "#fff",
      padding: "40px 20px",
      borderRadius: "10px",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      textAlign: "center"
    },
    logoContainer: {
      marginBottom: "20px"
    },
    logo: {
      width: "150px",
      height: "150px",
      objectFit: "contain"
    },
    headerText: {
      maxWidth: "800px"
    },
    headerTitle: {
      color: "#2c3e50",
      margin: 0,
      fontSize: "32px",
      marginBottom: "10px"
    },
    subtitle: {
      color: "#7f8c8d",
      margin: "5px 0 0",
      fontSize: "18px",
      lineHeight: "1.5"
    },
    sectionTitle: {
      color: "#2c3e50",
      borderBottom: "2px solid #3498db",
      paddingBottom: "10px",
      marginBottom: "20px",
      fontSize: "24px"
    },
    quickActions: {
      marginTop: "30px"
    },
    actionCardsContainer: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
      gap: "20px"
    },
    actionCard: {
      background: "white",
      borderRadius: "10px",
      padding: "25px",
      textAlign: "center",
      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
      transition: "all 0.3s ease"
    },
    actionButton: {
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "5px",
      cursor: "pointer",
      fontWeight: "bold",
      transition: "background-color 0.3s",
      fontSize: "16px",
      marginTop: "15px"
    },
    cardIcon: {
      fontSize: "50px",
      opacity: "0.7",
      marginBottom: "15px"
    },
    cardTitle: {
      margin: "0 0 10px",
      color: "#2c3e50",
      fontSize: "20px"
    }
  };

  // Estilo para el hover (se aplica dinámicamente)
  const cardHover = {
    transform: "translateY(-5px)",
    boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)"
  };

  const buttonHover = {
    backgroundColor: "#2980b9"
  };

  return (
    <div style={styles.home}>
      <div style={styles.container}>
        {/* Header con logo y título */}
        <header style={styles.homeHeader}>
          <div style={styles.logoContainer}>
            <img 
              src="/icono_disp.png" 
              alt="Logo Dispensario Médico" 
              style={styles.logo}
            />
          </div>
          <div style={styles.headerText}>
            <h1 style={styles.headerTitle}>Bienvenido al Dispensario Médico</h1>
            <p style={styles.subtitle}>
              Sistema integral para la gestión de pacientes, citas médicas y registros de atención.
              <br />
              Optimiza tu flujo de trabajo y brinda una mejor experiencia a tus pacientes.
            </p>
          </div>
        </header>

        {/* Tarjetas de acciones rápidas */}
        <section style={styles.quickActions}>
          <h2 style={styles.sectionTitle}>Acciones Rápidas</h2>
          <div style={styles.actionCardsContainer}>
            <div 
              style={styles.actionCard}
              onMouseEnter={e => Object.assign(e.currentTarget.style, cardHover)}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={styles.cardIcon}>👤</div>
              <h3 style={styles.cardTitle}>Ingreso de Pacientes</h3>
              <p>Registra nuevos pacientes en el sistema.</p>
              <button 
                style={styles.actionButton}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2980b9"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3498db"}
                onClick={() => window.location.href = '/pacientes'}
              >
                Acceder
              </button>
            </div>
            
            <div 
              style={styles.actionCard}
              onMouseEnter={e => Object.assign(e.currentTarget.style, cardHover)}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={styles.cardIcon}>📝</div>
              <h3 style={styles.cardTitle}>Agendamiento de Citas</h3>
              <p>Gestiona citas médicas de manera eficiente.</p>
              <button 
                style={styles.actionButton}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2980b9"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3498db"}
                onClick={() => window.location.href = '/citas'}
              >
                Acceder
              </button>
            </div>
            
            <div 
              style={styles.actionCard}
              onMouseEnter={e => Object.assign(e.currentTarget.style, cardHover)}
              onMouseLeave={e => {
                e.currentTarget.style.transform = "";
                e.currentTarget.style.boxShadow = "0 4px 6px rgba(0, 0, 0, 0.1)";
              }}
            >
              <div style={styles.cardIcon}>🏥</div>
              <h3 style={styles.cardTitle}>Reporte de Atención</h3>
              <p>Documenta cada consulta y tratamiento.</p>
              <button 
                style={styles.actionButton}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = "#2980b9"}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = "#3498db"}
                onClick={() => window.location.href = '/reporte-atenciones'}
              >
                Acceder
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}