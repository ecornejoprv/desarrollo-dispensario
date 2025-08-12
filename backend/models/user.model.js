import { db } from '../database/databasePostgres.js';

const create = async ({ username, password, email }) => {
    const query = {
        text: `
        INSERT INTO dispensario.usuarios (usua_nom_usua, usua_pass_usua, usua_email_usua)
        VALUES ($1, $2, $3)
        RETURNING usua_nom_usua, usua_email_usua, usua_cod_usua, role_id
        `,
        values: [username, password, email]
    }

    const { rows } = await db.query(query)
    return rows[0]
}

const findOneByUserName = async (username) => {
    const query = {
        text: `
        SELECT
            u.*,
            -- Usamos COALESCE para que si no hay empresas asociadas, devuelva un array vacío en lugar de [NULL]
            COALESCE(ARRAY_AGG(ue.empr_cod_empr) FILTER (WHERE ue.empr_cod_empr IS NOT NULL), ARRAY[]::int[]) AS empresas_acceso
        FROM dispensario.usuarios u
        LEFT JOIN dispensario.usuario_empresa ue ON u.usua_cod_usua = ue.usua_cod_usua
        WHERE u.usua_nom_usua = $1
        GROUP BY u.usua_cod_usua
        `,
        values: [username]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const getEspecialidadByMedicoId = async (medicoId) => {
    const query = {
      text: `
        SELECT espe_nom_espe 
        FROM dispensario.dmespec
        JOIN dispensario.dmmedic ON dmespec.espe_cod_espe = dmmedic.medic_cod_espe
        WHERE dmmedic.medic_cod_medic = $1
      `,
      values: [medicoId],
    };
  
    const { rows } = await db.query(query);
    return rows[0]?.espe_nom_espe || null; // Devuelve el nombre de la especialidad o null si no existe
  };

const findAll = async () => { 
    const query = {
        text: `
        SELECT * FROM dispensario.usuarios
        `
    }
    const { rows } = await db.query(query)
    return rows
}

const findOneByUid = async (uid) => {
    const query = {
        text: `
        SELECT * FROM dispensario.usuarios
        WHERE usua_cod_usua = $1
        `,
        values: [uid]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

const updateRoleMed = async (uid) => {
    const query = {
        text: `
        UPDATE dispensario.usuarios
        SET role_id = 2
        WHERE usua_cod_usua = $1
        RETURNING usua_nom_usua, role_id
        `,
        values: [uid]
    }
    const { rows } = await db.query(query)
    return rows[0]
}

// NUEVO MÉTODO: Encuentra los códigos de empresa para un usuario
const findPermissionsByUid = async (uid) => {
    const query = {
        text: `SELECT empr_cod_empr FROM dispensario.usuario_empresa WHERE usua_cod_usua = $1`,
        values: [uid]
    };
    const { rows } = await db.query(query);
    // Devuelve un array de IDs, ej: [182, 222]
    return rows.map(row => row.empr_cod_empr);
};

// NUEVO MÉTODO: Actualiza los permisos (borra los viejos e inserta los nuevos)
const updatePermissionsForUser = async (uid, companyIds) => {
    // Usamos una transacción para asegurar que la operación sea atómica (o todo o nada)
    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // 1. Borra todos los permisos existentes para este usuario
        const deleteQuery = 'DELETE FROM dispensario.usuario_empresa WHERE usua_cod_usua = $1';
        await client.query(deleteQuery, [uid]);

        // 2. Inserta los nuevos permisos uno por uno
        if (companyIds && companyIds.length > 0) {
            const insertQuery = 'INSERT INTO dispensario.usuario_empresa (usua_cod_usua, empr_cod_empr) VALUES ($1, $2)';
            for (const companyId of companyIds) {
                await client.query(insertQuery, [uid, companyId]);
            }
        }
        
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error; // Lanza el error para que el controlador lo atrape
    } finally {
        client.release(); // Libera la conexión
    }
};

export const UserModel = {
    create,
    findOneByUserName,
    findAll,
    findOneByUid,
    updateRoleMed,
    getEspecialidadByMedicoId,
    findPermissionsByUid,      
    updatePermissionsForUser  
}