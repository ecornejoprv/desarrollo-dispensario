// pages/CompanySelector.jsx (NUEVO ARCHIVO)
import React from 'react';
import { useAuth } from '../components/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { COMPANY_GROUPS } from '../config/companyGroups.js';// ¡Importante! Asegúrate que la ruta sea correcta o copia el objeto aquí.

export default function CompanySelector() {
    const { user, setActiveCompanies } = useAuth(); // Necesitaremos 'setActiveCompanies' del context
    const navigate = useNavigate();

    // Determina a qué grupos tiene acceso el usuario
    const accessibleGroups = [];
    if (user) {
        for (const groupKey in COMPANY_GROUPS) {
            // Si alguna de las empresas del grupo está en los permisos del usuario, tiene acceso a ese grupo.
            if (COMPANY_GROUPS[groupKey].companies.some(c => user.companies.includes(c))) {
                accessibleGroups.push({ key: groupKey, ...COMPANY_GROUPS[groupKey] });
            }
        }
    }

    const handleSelectGroup = (group) => {
        // Llama a la función del context para establecer el grupo activo
        setActiveCompanies(group.companies);
        // Redirige a la página de inicio
        navigate('/home');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <h2>Selecciona tu lugar de trabajo</h2>
            <div style={{ display: 'flex', gap: '20px' }}>
                {accessibleGroups.map(group => (
                    <button key={group.key} onClick={() => handleSelectGroup(group)} style={{ padding: '20px', fontSize: '18px' }}>
                        {group.name}
                    </button>
                ))}
            </div>
        </div>
    );
}