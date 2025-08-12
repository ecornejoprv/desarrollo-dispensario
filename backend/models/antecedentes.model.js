import { db } from '../database/databasePostgres.js';

// Antecedentes Personales
export const crearAntecedentePersonal = async (pacienteId, observacion) => {
  const query = `
    INSERT INTO dispensario.dmanper (
      anper_cod_pacie, 
      anper_fec_anper, 
      anper_obs_anper
    ) 
    VALUES ($1, CURRENT_TIMESTAMP, $2)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [pacienteId, observacion]);
  return rows[0];
};

export const obtenerAntecedentesPersonales = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmanper 
    WHERE anper_cod_pacie = $1
    ORDER BY anper_fec_anper DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

// Antecedentes Gineco-Obstétricos
export const crearAntecedenteGineco = async (data) => {
  const query = `
    INSERT INTO dispensario.dmangin (
      angin_cod_pacie, 
      angin_fec_angin, 
      angin_nci_angin, 
      angi_tie_ciclos, 
      angi_fum_angi, 
      angi_nge_angi, 
      angi_npa_angi, 
      angi_nce_angi, 
      angi_nab_angi, 
      angi_nvi_angi, 
      angi_nmu_angi, 
      angi_ase_angi,
      angi_man_angi
    ) 
    VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.pacienteId,
    data.numCiclos,
    data.tiempoCiclos,
    data.fum,
    data.numGestas,
    data.numPartos,
    data.numCesareas,
    data.numAbortos,
    data.numHijosVivos,
    data.numHijosMuertos,
    data.actividadSexual,
    data.metodoanticonceptivo
  ]);
  return rows[0];
};

export const obtenerAntecedentesGineco = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmangin 
    WHERE angin_cod_pacie = $1
    ORDER BY angin_fec_angin DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

// Antecedentes de Trabajo
export const crearAntecedenteTrabajo = async (data) => {
  const query = `
    INSERT INTO dispensario.dmantra (
      antra_cod_pacie,
      antra_empr_antra,
      antra_pue_antra,
      antra_act_antra,
      antra_tie_antra,
      antra_fec_antra,
      antra_rfi_antra,
      antra_rme_antra,
      antra_rqui_antra,
      antra_rbi_antra,
      antra_rer_antra,
      antra_rps_antra
    )
    VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9, $10, $11)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.pacienteId,
    data.empresa,
    data.puesto,
    data.actividad,
    data.tiempo,
    data.riesgoFisico ? 1 : 0,  
    data.riesgoMecanico ? 1 : 0,
    data.riesgoQuimico ? 1 : 0,
    data.riesgoBiologico ? 1 : 0,
    data.riesgoErgonomico ? 1 : 0,
    data.riesgoPsicosocial ? 1 : 0
  ]);
  return rows[0];
};

export const obtenerAntecedentesTrabajo = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmantra 
    WHERE antra_cod_pacie = $1
    ORDER BY antra_fec_antra DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

// Historial Tóxico y Estilo de Vida
export const crearHistorialToxico = async (data) => {
  const query = `
    INSERT INTO dispensario.dmhtev (
      htev_cod_pacie,
      htev_dco_htev,
      htev_tco_htev,
      htev_cco_htev,
      htev_tab_htev,
      htev_dev_htev,
      htev_tes_htev,
      htev_tev_htev
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.pacienteId ,
    data.detalleConsumo || null,
    data.tiempoConsumo || null,
    data.cantidadConsumo || null,
    data.tiempoAbstinencia || null,
    data.descripcionEstiloVida || null,
    data.tiempoPractica || null,
    data.tiempoEstiloVida || null
  ]);
  return rows[0];
};

export const obtenerHistorialToxico = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmhtev 
    WHERE htev_cod_pacie = $1
    ORDER BY htev_cod_htev DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

// Accidentes y Enfermedades
export const crearAccidenteEnfermedad = async (data) => {
  const query = `
    INSERT INTO dispensario.dmaccep (
      accep_cod_pacie,
      accep_des_accep,
      accep_iess_accep,
      accep_dae_accep
    )
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.pacienteId,
    data.descripcion || null,
    data.registradoIess ? 1 : 0,
    data.detalle || null
  ]);
  return rows[0];
};

export const obtenerAccidentesEnfermedades = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmaccep 
    WHERE accep_cod_pacie = $1
    ORDER BY accep_cod_accep DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};

// Actividades Extralaborales
export const crearActividadExtralaboral = async (data) => {
  const query = `
    INSERT INTO dispensario.dmaexla (
      aexla_cod_pacie,
      aexla_des_aexla
    )
    VALUES ($1, $2)
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.pacienteId,
    data.descripcion
  ]);
  return rows[0];
};

export const obtenerActividadesExtralaborales = async (pacienteId) => {
  const query = `
    SELECT * FROM dispensario.dmaexla 
    WHERE aexla_cod_pacie = $1
    ORDER BY aexla_cod_aexla DESC;
  `;
  const { rows } = await db.query(query, [pacienteId]);
  return rows;
};
// Antecedentes Personales - UPDATE
export const actualizarAntecedentePersonal = async (id, observacion) => {
  const query = `
    UPDATE dispensario.dmanper 
    SET anper_obs_anper = $1
    WHERE anper_cod_anper = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [observacion,id]);
  return rows[0];
};

// Antecedentes Gineco-Obstétricos - UPDATE
export const actualizarAntecedenteGineco = async (id, data) => {
  const query = `
    UPDATE dispensario.dmangin 
    SET 
      angin_nci_angin = $1,
      angi_tie_ciclos = $2,
      angi_fum_angi = $3,
      angi_nge_angi = $4,
      angi_npa_angi = $5,
      angi_nce_angi = $6,
      angi_nab_angi = $7,
      angi_nvi_angi = $8,
      angi_nmu_angi = $9,
      angi_ase_angi = $10,
      angi_man_angi = $11
    WHERE angin_cod_angin = $12
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.numCiclos,
    data.tiempoCiclos,
    data.fum,
    data.numGestas,
    data.numPartos,
    data.numCesareas,
    data.numAbortos,
    data.numHijosVivos,
    data.numHijosMuertos,
    data.actividadSexual,
    data.metodoanticonceptivo,
    id
  ]);
  return rows[0];
};

// Antecedentes de Trabajo - UPDATE
export const actualizarAntecedenteTrabajo = async (id, data) => {
  const query = `
    UPDATE dispensario.dmantra 
    SET
      antra_empr_antra = $1,
      antra_pue_antra = $2,
      antra_act_antra = $3,
      antra_tie_antra = $4,
      antra_rfi_antra = $5,
      antra_rme_antra = $6,
      antra_rqui_antra = $7,
      antra_rbi_antra = $8,
      antra_rer_antra = $9,
      antra_rps_antra = $10
    WHERE antra_cod_antra = $11
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.empresa,
    data.puesto,
    data.actividad,
    data.tiempo,
    data.riesgoFisico ? 1 : 0,
    data.riesgoMecanico ? 1 : 0,
    data.riesgoQuimico ? 1 : 0,
    data.riesgoBiologico ? 1 : 0,
    data.riesgoErgonomico ? 1 : 0,
    data.riesgoPsicosocial ? 1 : 0,
    id
  ]);
  return rows[0];
};

// Historial Tóxico y Estilo de Vida - UPDATE
export const actualizarHistorialToxico = async (id, data) => {
  const query = `
    UPDATE dispensario.dmhtev 
    SET
      htev_dco_htev = $1,
      htev_tco_htev = $2,
      htev_cco_htev = $3,
      htev_tab_htev = $4,
      htev_dev_htev = $5,
      htev_tes_htev = $6
    WHERE htev_cod_htev = $7
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.detalleConsumo || null,
    data.tiempoConsumo || null,
    data.cantidadConsumo || null,
    data.tiempoAbstinencia || null,
    data.descripcionEstiloVida || null,
    data.tiempoPractica || null,
    id
  ]);
  return rows[0];
};

// Accidentes y Enfermedades - UPDATE
export const actualizarAccidenteEnfermedad = async (id, data) => {
  const query = `
    UPDATE dispensario.dmaccep 
    SET
      accep_des_accep = $1,
      accep_iess_accep = $2,
      accep_dae_accep = $3
    WHERE accep_cod_accep = $4
    RETURNING *;
  `;
  const { rows } = await db.query(query, [
    data.descripcion || null,
    data.registradoIess ? 1 : 0,
    data.detalle || null,
    id
  ]);
  return rows[0];
};

// Actividades Extralaborales - UPDATE
export const actualizarActividadExtralaboral = async (id, descripcion) => {
  const query = `
    UPDATE dispensario.dmaexla 
    SET aexla_des_aexla = $1
    WHERE aexla_cod_aexla = $2
    RETURNING *;
  `;
  const { rows } = await db.query(query, [descripcion, id]);
  return rows[0];
};

// Antecedentes Personales - DELETE
export const eliminarAntecedentePersonal = async (id) => {
  const query = `
    DELETE FROM dispensario.dmanper 
    WHERE anper_cod_anper = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

// Antecedentes Gineco-Obstétricos - DELETE
export const eliminarAntecedenteGineco = async (id) => {
  const query = `
    DELETE FROM dispensario.dmangin 
    WHERE angin_cod_angin = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

// Antecedentes de Trabajo - DELETE
export const eliminarAntecedenteTrabajo = async (id) => {
  const query = `
    DELETE FROM dispensario.dmantra 
    WHERE antra_cod_antra = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

// Historial Tóxico y Estilo de Vida - DELETE
export const eliminarHistorialToxico = async (id) => {
  const query = `
    DELETE FROM dispensario.dmhtev 
    WHERE htev_cod_htev = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

// Accidentes y Enfermedades - DELETE
export const eliminarAccidenteEnfermedad = async (id) => {
  const query = `
    DELETE FROM dispensario.dmaccep 
    WHERE accep_cod_accep = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};

// Actividades Extralaborales - DELETE
export const eliminarActividadExtralaboral = async (id) => {
  const query = `
    DELETE FROM dispensario.dmaexla 
    WHERE aexla_cod_aexla = $1
    RETURNING *;
  `;
  const { rows } = await db.query(query, [id]);
  return rows[0];
};
