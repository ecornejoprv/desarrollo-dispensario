// src/context/AuthContext.jsx (Código Absolutamente Completo y Corregido)
// ==============================================================================
// @summary: Se actualiza la función 'login' para establecer una ubicación activa
//           predeterminada inmediatamente después de iniciar sesión. Esto mejora
//           la experiencia de usuario al preseleccionar 'Provefrut' (ID 1) para el grupo
//           'PROVEFRUT', evitando selecciones ambiguas.
// ==============================================================================

import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../../api';
import { COMPANY_GROUPS, getUserGroups } from '../../config/companyGroups.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [activeCompanies, setActiveCompanies] = useState([]);
    const [activeLocation, setActiveLocation] = useState(null); 
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const storedUser = {
                username: localStorage.getItem('username'),
                fullName: localStorage.getItem('fullName'),
                role: localStorage.getItem('role'),
                companies: JSON.parse(localStorage.getItem('userCompanies') || '[]'),
                especialista: localStorage.getItem('especialista'),
                especialidad: localStorage.getItem('especialidad'),
            };
            const storedActiveCompanies = JSON.parse(localStorage.getItem('activeCompanies') || '[]');
            const storedActiveLocation = localStorage.getItem('activeLocation');
            setUser(storedUser);
            setActiveCompanies(storedActiveCompanies);
            if (storedActiveLocation) {
                setActiveLocation(Number(storedActiveLocation));
            }
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const login = async (username, password, selectedGroupKey) => {
        const { data } = await api.post("/api/v1/users/login", { username, password });
        if (!data.ok) throw new Error(data.msg || 'Credenciales incorrectas.');
        
        const totalUserPermissions = data.msg.empresas_acceso || [];
        const groupToLogin = COMPANY_GROUPS[selectedGroupKey];
        const hasPermissionForGroup = groupToLogin.companies.some(id => totalUserPermissions.includes(id));

        if (!hasPermissionForGroup) {
            throw new Error(`No tiene permisos para acceder al ${groupToLogin.name}.`);
        }
        
        localStorage.removeItem('activeLocation');
        localStorage.clear();
        setActiveLocation(null);
        
        localStorage.setItem("token", data.msg.token);
        localStorage.setItem("role", data.msg.role_id);
        localStorage.setItem("username", data.msg.username);
        localStorage.setItem("fullName", data.msg.nombre_completo);
        localStorage.setItem("especialista", data.msg.especialista);
        localStorage.setItem("especialidad", data.msg.especialidad);
        localStorage.setItem("userCompanies", JSON.stringify(totalUserPermissions));
        localStorage.setItem('activeCompanies', JSON.stringify(groupToLogin.companies));

        const loggedInUser = {
            username: data.msg.username,
            fullName: data.msg.nombre_completo,
            role: data.msg.role_id,
            companies: totalUserPermissions,
            especialista: data.msg.especialista,
            especialidad: data.msg.especialidad,
        };
        
        setUser(loggedInUser);
        setActiveCompanies(groupToLogin.companies);
        setIsAuthenticated(true);

        // --- CAMBIO CLAVE: Establecer la ubicación activa por defecto ---
        let defaultLocationId = null;        
        if (selectedGroupKey === 'PROVEFRUT') {
            defaultLocationId = 1; 
        } else if (selectedGroupKey === 'PROCONGELADOS') {
            defaultLocationId = 3; 
        }

        //console.log(`[AuthContext Debug] Grupo seleccionado: ${selectedGroupKey}. ID de ubicación por defecto: ${defaultLocationId}`);


        // Si se encontró una ubicación por defecto, se establece.
        if (defaultLocationId) {
            selectActiveLocation(defaultLocationId);
        }

        return data;
    };

    const selectActiveLocation = (locationId) => {
        const id = Number(locationId);
        setActiveLocation(id);
        localStorage.setItem('activeLocation', id);
        //console.log(`[AuthContext Debug] selectActiveLocation llamado con ID: ${id}. Valor guardado en localStorage.`);
    };

    const logout = () => {
        window.location.href = '/login';
        setUser(null);
        setIsAuthenticated(false);
        setActiveCompanies([]);
        setActiveLocation(null);
        localStorage.clear();
    };
    
    const value = { user, isAuthenticated, loading, login, logout, activeCompanies, activeLocation, selectActiveLocation };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};