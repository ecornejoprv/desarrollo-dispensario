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
        SELECT * FROM dispensario.usuarios
        WHERE usua_nom_usua = $1
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

export const UserModel = {
    create,
    findOneByUserName,
    findAll,
    findOneByUid,
    updateRoleMed,
    getEspecialidadByMedicoId
}