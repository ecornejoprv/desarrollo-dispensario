import { useState, useEffect } from "react"; // Solo importa lo que necesitas
import api from "../api"; // Importar la instancia de Axios
import { useNavigate } from "react-router-dom";
import { Container, TextField, Button, Typography, Box, InputAdornment, IconButton } from "@mui/material";
import { AccountCircle, Lock, Input, Visibility, VisibilityOff } from "@mui/icons-material";
import { createTheme, ThemeProvider } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
  },
  components: {
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#4caf50',
          },
        },
      },
    },
  },
});

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Verificar si el usuario ya está autenticado
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      navigate("/home"); // Redirigir a /home si ya está autenticado
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        // Hacer la solicitud de login al backend
        const { data } = await api.post("/api/v1/users/login", { username, password });
  
        if (data.ok) {
            // Guardar el token y el rol en localStorage
            localStorage.setItem("token", data.msg.token);
            localStorage.setItem("role", data.msg.role_id);
            localStorage.setItem("username", data.msg.username);

            console.log(data.msg.token, data.msg.role_id, data.msg.username);

            // Redirigir a /home
            navigate("/Home");
        } else {
            setError(data.msg || "Error during login.");
        }
    } catch {
        setError("Invalid credentials. Please try again.");
    }
};

  const handleMouseDownPassword = () => {
    setShowPassword(true);
  };

  const handleMouseUpPassword = () => {
    setShowPassword(false);
  };

  return (
    <ThemeProvider theme={theme}>
    <div style={{ minHeight: '100vh', background: 'rgba(76, 175, 80, 0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box', margin: 0 }}>
      <Container maxWidth="sm" style={{ backgroundColor: 'white', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)', padding: '32px' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography component="h1" variant="h5" style={{ marginBottom: '16px', fontWeight: 'bold', color: '#333' }}>
            Dispensario Médico 
            </Typography>
            <Typography style={{ marginBottom: '24px', color: '#666' }}>
              Inicia sesión en tu cuenta
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
            <TextField
                margin="normal"
                required
                fullWidth
                id="username"
                label="Nombre de usuario"
                name="username"
                autoComplete="username"
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccountCircle />
                      </InputAdornment>
                    ),
                  },
                }}
                variant="outlined"
                style={{ marginBottom: '16px' }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Contraseña"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onMouseDown={handleMouseDownPassword}
                          onMouseUp={handleMouseUpPassword}
                          onMouseLeave={handleMouseUpPassword}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
                variant="outlined"
                style={{ marginBottom: '24px' }}
              />
              {error && (
                <Typography color="error" style={{ marginBottom: '16px' }}>
                  {error}
                </Typography>
              )}
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                startIcon={<Input />}
                style={{ padding: '12px 0', fontWeight: 'bold', backgroundColor: '#4caf50', color: 'white' }}
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