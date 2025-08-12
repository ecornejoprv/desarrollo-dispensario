// src/config/companyGroups.js

// Este objeto define los grupos lógicos de trabajo.
// La clave (ej. 'PROVEFRUT') es un identificador interno.
// 'name' es lo que verá el usuario.
// 'companies' es el array de códigos de empresa que pertenecen a ese grupo.
export const COMPANY_GROUPS = {
  PROVEFRUT: {
    name: 'Dispensario Provefrut / Nintanga',
    companies: [182, 222]
  },
  PROCONGELADOS: {
    name: 'Dispensario Procongelados',
    companies: [192]
  }
};

// También exportamos una función de ayuda para determinar a qué grupos
// pertenece un usuario basándose en todos sus permisos.
export const getUserGroups = (userCompanies) => {
    const groups = new Set(); // Usamos un Set para evitar duplicados
    for (const companyId of userCompanies) {
        for (const groupKey in COMPANY_GROUPS) {
            if (COMPANY_GROUPS[groupKey].companies.includes(companyId)) {
                groups.add(groupKey);
            }
        }
    }
    return Array.from(groups); // Devuelve ['PROVEFRUT', 'PROCONGELADOS'] si tiene acceso a ambos
};