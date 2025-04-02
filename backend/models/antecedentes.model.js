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
      angi_ase_angi
    ) 
    VALUES ($1, CURRENT_DATE, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
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
    data.actividadSexual
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
    data.riesgoFisico || false,
    data.riesgoMedico || false,
    data.riesgoQuimico || false,
    data.riesgoBiologico || false,
    data.riesgoErgonomico || false,
    data.riesgoPsicosocial || false
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
    data.pacienteId,
    data.detalleConsumo,
    data.tiempoConsumo,
    data.cantidadConsumo,
    data.tiempoAbstinencia,
    data.descripcionEstiloVida,
    data.tiempoPractica,
    data.tiempoEstiloVida
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
    data.descripcion,
    data.registradoIess || false,
    data.detalle
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