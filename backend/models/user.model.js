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
    updateRoleMed
}