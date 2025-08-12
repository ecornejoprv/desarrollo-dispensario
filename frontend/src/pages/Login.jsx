// src/pages/Login.jsx (Versión Definitiva con Tema Dinámico y Prop 'sx')
// ==============================================================================
// @summary: Se utiliza la prop 'sx' en el componente Button para garantizar
//           que el color de fondo se actualice dinámicamente. La prop 'sx'
//           tiene una mayor especificidad y es la forma recomendada en MUI v5+
//           para aplicar estilos que dependen del estado o del tema.
// ==============================================================================

// --- 1. IMPORTACIONES ---
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/context/AuthContext";
import { COMPANY_GROUPS } from '../config/companyGroups.js';
import { Container, TextField, Button, Typography, Box, InputAdornment, IconButton, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { AccountCircle, Lock, Visibility, VisibilityOff, Business } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

// --- 2. DEFINICIÓN DEL COMPONENTE ---
export default function Login() {
  // --- ESTADOS LOCALES ---
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedGroup, setSelectedGroup] = useState('PROVEFRUT'); // El valor por defecto es 'PROVEFRUT' (verde)
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();

  // --- TEMA DINÁMICO ---
  // Esta lógica sigue siendo correcta y necesaria para los estilos globales y de los TextField.
  const theme = useMemo(() => {
    const primaryColor = selectedGroup === 'PROCONGELADOS' 
      ? '#0D47A1' // Azul oscuro para Procongelados
      : '#1B5E20'; // Verde oscuro para Provefrut / Nintanga

    return createTheme({
      palette: {
        primary: {
          main: primaryColor,
        },
      },
      components: {
        MuiOutlinedInput: {
          styleOverrides: {
            root: {
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: primaryColor,
              },
            },
          },
        },
      },
    });
  }, [selectedGroup]);

  // EFECTO DE REDIRECCIÓN (sin cambios)
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home");
    }
  }, [isAuthenticated, navigate]);

  // MANEJADOR DEL ENVÍO DEL FORMULARIO (sin cambios)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(username, password, selectedGroup);
      navigate("/home");
    } catch (err) {
      if (err.response && err.response.data && err.response.data.msg) {
        // Si el backend envió un mensaje (ej. "Usuario o contraseña incorrectos"), lo mostramos.
        setError(err.response.data.msg);
      } else {
        // Si no, es probablemente un error de red y mostramos el mensaje genérico.
        setError(err.message || "Error de conexión. Inténtalo de nuevo.");
      }
    }
  };

  // MANEJADOR DE VISIBILIDAD DE CONTRASEÑA (sin cambios)
  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // --- 3. RENDERIZADO DEL COMPONENTE (JSX) ---
  return (
    <ThemeProvider theme={theme}>
      <div style={{ minHeight: '100vh', background: '#f4f6f8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Container maxWidth="sm" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '32px' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" style={{ marginBottom: '16px', fontWeight: 'bold' }}>
              Dispensario Médico
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
              
              <FormControl fullWidth margin="normal" variant="outlined">
                <InputLabel id="group-select-label">Dispensario</InputLabel>
                <Select
                  labelId="group-select-label"
                  id="group-select"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  label="Dispensario"
                  startAdornment={
                    <InputAdornment position="start">
                      <Business />
                    </InputAdornment>
                  }
                >
                  {Object.keys(COMPANY_GROUPS).map((key) => (
                    <MenuItem key={key} value={key}>
                      {COMPANY_GROUPS[key].name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                margin="normal"
                required
                fullWidth
                label="Nombre de usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><AccountCircle /></InputAdornment>),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                InputProps={{
                  startAdornment: (<InputAdornment position="start"><Lock /></InputAdornment>),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleTogglePasswordVisibility} edge="end">
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              {error && (
                <Typography color="error" align="center" style={{ margin: '16px 0' }}>
                  {error}
                </Typography>
              )}
              
              {/* --- CORRECCIÓN DEFINITIVA AQUÍ --- */}
              <Button 
                type="submit" 
                fullWidth 
                variant="contained" 
                // La prop 'color' sigue siendo importante para la semántica y estilos base.
                color="primary"
                // La prop 'sx' aplica estilos directos con acceso al tema.
                // Esto garantiza que el backgroundColor sea el color primario dinámico.
                sx={{ 
                    padding: '12px 0', 
                    fontWeight: 'bold', 
                    marginTop: '16px',
                    // 'primary.main' hace referencia al color definido en la paleta del tema.
                    backgroundColor: 'primary.main', 
                    // Opcional: define un color más oscuro para el hover.
                    '&:hover': {
                        backgroundColor: 'primary.dark',
                    }
                }}
              >
                Iniciar sesión
              </Button>
            </Box>
          </Box>
        </Container>
      </div>
    </ThemeProvider>
  );
}