// frontend/src/config/companyGroups.js

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

export const getUserGroups = (userCompanies) => {
    const groups = new Set();
    for (const companyId of userCompanies) {
        for (const groupKey in COMPANY_GROUPS) {
            if (COMPANY_GROUPS[groupKey].companies.includes(companyId)) {
                groups.add(groupKey);
            }
        }
    }
    return Array.from(groups);
};