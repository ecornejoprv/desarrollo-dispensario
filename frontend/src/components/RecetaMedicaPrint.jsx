// src/components/RecetaMedicaPrint.jsx (Código Absolutamente Completo y Final)
// ==============================================================================
// @summary: Componente reutilizable y autónomo para generar el formato de impresión
//           de una receta médica. Al recibir un 'atencionId', busca todos sus
//           datos y los maqueta en formato A4 horizontal. Renderiza la cabecera
//           correcta según la ubicación (Provefrut/Nintanga o Procongelados).
// ==============================================================================

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import api from '../api';

// --- Funciones de Ayuda (Helpers) ---
const capitalize = (str) => {
    if (!str) return '';
    const lower = str.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
};

const calcularEdad = (fechaNacimiento) => {
    if (!fechaNacimiento) return '';
    const hoy = new Date();
    const nacimiento = new Date(fechaNacimiento);
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mes = hoy.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edad--;
    }
    return edad;
};

const numeroALetras = (num) => {
    const unidades = ["", "uno", "dos", "tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"];
    const decenas = ["", "diez", "veinte", "treinta", "cuarenta", "cincuenta", "sesenta", "setenta", "ochenta", "noventa"];
    const especiales = ["once", "doce", "trece", "catorce", "quince", "dieciséis", "diecisiete", "dieciocho", "diecinueve"];
    num = parseInt(num) || 1;
    if (num < 1) num = 1;
    if (num > 99) num = 99;
    if (num < 10) return unidades[num];
    if (num === 10) return "diez";
    if (num >= 11 && num <= 19) return especiales[num - 11];
    const decena = Math.floor(num / 10);
    const unidad = num % 10;
    if (unidad === 0) return decenas[decena];
    if (decena === 2) return "veinti" + unidades[unidad];
    return decenas[decena] + " y " + unidades[unidad];
};

const formatDate = () => new Date().toLocaleDateString("es-ES", { day: "numeric", month: "long", year: "numeric" });

const getLocationSpecificData = (locationId) => {
    // Si la ubicación es 3 (Procongelados)
    if (locationId === 3) {
        return {
            city: 'Machachi',
            formCode: 'RDM027'
        };
    }
    // Por defecto, se usan los datos de Provefrut / Nintanga
    return {
        city: 'Guaytacama',
        formCode: 'Form: FJS-PV0012'
    };
};

// --- SUB-COMPONENTE PARA LA CABECERA DINÁMICA ---
const RecetaHeader = ({ locationId, numeroReceta }) => {
    // Si la ubicación es 3 (Procongelados)
    if (locationId === 3) {
        return (
            <div className="header-container">
                <img src="/procongelados.jpg" alt="Logo Procongelados" className="logo" />
                <div className="header-text">
                    <p className="clinic-name">Dispensario Médico Procongelados</p>
                    {numeroReceta && <p className="numero-receta">N°. {numeroReceta}</p>}
                </div>
                {/* Espacio vacío a la derecha para mantener la alineación */}
                <div style={{ width: '80px', height: '35px' }}></div> 
            </div>
        );
    }

    // Cabecera por defecto para Provefrut y Nintanga (IDs 1 y 2)
    return (
        <div className="header-container">
            <img src="/provefrut.jpg" alt="Logo Provefrut" className="logo" />
            <div className="header-text">
                <p className="clinic-name">CENTRO DE SALUD TIPO B</p>
                <p className="clinic-type">PROVEFRUT - NINTANGA</p>
                {numeroReceta && <p className="numero-receta">N°. {numeroReceta}</p>}
            </div>
            <img src="/nintanga.jpg" alt="Logo Nintanga" className="logo" />
        </div>
    );
};

// --- COMPONENTE PRINCIPAL DE IMPRESIÓN ---
export const RecetaMedicaPrint = ({ atencionId, onPrintFinish }) => {
    const [datos, setDatos] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchRecetaData = async () => {
            if (!atencionId) {
                setError("No se proporcionó un ID de atención.");
                setLoading(false);
                return;
            }
            try {
                const response = await api.get(`/api/v1/recetas/${atencionId}`);
                setDatos(response.data);
            } catch (err) {
                console.error("Error al cargar datos de la receta:", err);
                setError(err.response?.data?.message || "Error al cargar los datos de la receta.");
            } finally {
                setLoading(false);
            }
        };
        fetchRecetaData();
    }, [atencionId]);

    useEffect(() => {
        if (!loading && datos) {
            const timer = setTimeout(() => {
                window.print();
                if (onPrintFinish) onPrintFinish();
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [loading, datos, onPrintFinish]);

    if (loading) {
        return <div className="print-container">Cargando datos de la receta para imprimir...</div>;
    }
    if (error) {
        return <div className="print-container">Error: {error}</div>;
    }
    if (!datos) {
        return <div className="print-container">No hay datos disponibles para mostrar.</div>;
    }
    
    const { 
        pacie_nom_pacie, pacie_ape_pacie, pacie_ced_pacie, pacie_fec_nac,
        medico_nombre, diagnosticos, prescripciones, indicaciones_generales, 
        signos_alarma, alergias, aten_num_receta, aten_cod_disu 
    } = datos;

    const { city, formCode } = getLocationSpecificData(aten_cod_disu);
    const prescripcionesEmpresa = prescripciones?.filter(p => p.pres_tip_pres === "Empresa") || [];
    const prescripcionesExterna = prescripciones?.filter(p => p.pres_tip_pres === "Externa") || [];

    const renderColumn = (type) => (
      <div className="column">
        <RecetaHeader locationId={aten_cod_disu} numeroReceta={aten_num_receta} />
        
        <div className="date">{city}, {formatDate()}</div>
        
        <div className="section-title">Datos del Paciente</div>
        <div className="patient-data">
            <span><strong>Nombre:</strong> {capitalize(pacie_nom_pacie)} {capitalize(pacie_ape_pacie)}</span>
            <span><strong>Cédula:</strong> {pacie_ced_pacie}</span>
            <span><strong>Edad:</strong> {calcularEdad(pacie_fec_nac)} años</span>
        </div>
        
        {type === 'receta' && (
          <>
            <div className="section-title">Alergias</div>
            <div className="patient-data">
                {alergias?.length > 0 ? (
                    <span style={{color: 'red', fontWeight: 'bold'}}>{alergias.map(a => capitalize(a.aler_nom_aler)).join(', ')}</span>
                ) : (
                    <span>N/A</span>
                )}
            </div>
          </>
        )}
        
        {type === 'receta' && (
          <>
            {diagnosticos?.length > 0 && (
                <>
                    <div className="section-title">Diagnóstico(s) (CIE-10):</div>
                    <ul className="list">{diagnosticos.map((d, i) => <li key={i}>{d.cie10_id_cie10} - {d.cie10_nom_cie10}</li>)}</ul>
                </>
            )}
            <div className="section-title">Rp.</div>
            {prescripcionesEmpresa.length > 0 && (
                <>
                    <div className="med-group-title">Medicación Interna:</div>
                    <div className="prescripciones-list">{prescripcionesEmpresa.map((p, i) => <div key={i} className="prescripcion-item">{i + 1}. {capitalize(p.pres_nom_prod)} - #{p.pres_can_pres} ({numeroALetras(p.pres_can_pres)}) {p._siglas_unid || "UN"}</div>)}</div>
                </>
            )}
            {prescripcionesExterna.length > 0 && (
                <>
                    <div className="med-group-title">Medicación Externa:</div>
                    <div className="prescripciones-list">{prescripcionesExterna.map((p, i) => <div key={i} className="prescripcion-item">{i + 1}. {capitalize(p.pres_nom_prod)} - #{p.pres_can_pres} ({numeroALetras(p.pres_can_pres)}) {p._siglas_unid || "UN"}</div>)}</div>
                </>
            )}
          </>
        )}
        {type === 'indicaciones' && (
          <>
            {prescripciones?.length > 0 && (
                <>
                    <div className="section-title">Indicaciones Farmacológicas:</div>
                    {prescripciones.map((p, i) => (
                        <div key={i} className="indicacion-farmacologica">
                            <div className="med-name">{i + 1}. {capitalize(p.pres_nom_prod)}</div>
                            <div>{p.pres_dos_pres} {p.pres_adm_pres} {p.pres_fre_pres} por {p.pres_dur_pres} día(s).</div>
                            {p.pres_ind_pres && <div style={{width: '100%'}}><i>{p.pres_ind_pres}</i></div>}
                        </div>
                    ))}
                </>
            )}
            <>
              <div className="section-title">Indicaciones no Farmacológicas:</div>
              <ul className="list">
                {indicaciones_generales?.length > 0 
                  ? indicaciones_generales.map((ind, i) => <li key={i}>{ind.indi_des_indi}</li>)
                  : null
                }
              </ul>
            </>
            <>
              <div className="section-title">Signos de Alarma:</div>
              <ul className="list">
                {signos_alarma?.length > 0
                  ? signos_alarma.map((s, i) => <li key={i}>{s.signa_des_signa}</li>)
                  : null
                }
              </ul>
            </>
          </>
        )}
        <div className="signature">
            <div className="signature-line"></div>
            <span>{medico_nombre || 'MÉDICO'}</span>
        </div>
        <div className="form-code">
            <div className="form-code">{formCode}</div>
        </div>
      </div>
    );

    return (
        <div className="print-container">
            <style>{`
                @media print {
                    @page { size: A4 landscape; margin: 1.5cm; }
                    body * { visibility: hidden; }
                    .print-container, .print-container * { visibility: visible; }
                    .print-container { position: absolute; left: 0; top: 0; width: 100%; height: 100%; font-family: 'Roboto', sans-serif; }
                    .page-grid { display: grid; grid-template-columns: 1fr 15px 1fr; gap: 0; height: 100%;}
                    .column { display: flex; flex-direction: column; position: relative; padding-right: 15px; box-sizing: border-box; }
                    .divider { border-left: 1px dashed #999; }
                    .header-container { display: flex; justify-content: space-between; align-items: center; text-align: center; margin-bottom: 0.5rem; }
                    .logo { height: 35px; width: auto; }
                    .header-text { flex-grow: 1; }
                    .clinic-name { font-size: 11pt; font-weight: 700; margin: 0; }
                    .clinic-type { font-size: 10pt; margin: 0; }
                    .numero-receta { font-size: 14pt; font-weight: 700; color: #d32f2f; margin-top: 5px; }
                    .date { font-size: 9pt; margin-bottom: 0.5rem; text-align: center; }
                    .section-title { font-weight: 700; font-size: 10pt; margin: 0.5rem 0 0.3rem; padding-bottom: 2px; border-bottom: 1px solid #333; }
                    .patient-data { font-size: 9pt; line-height: 1.4; display: flex; justify-content: space-between; flex-wrap: wrap; }
                    .list { list-style-type: disc; font-size: 9pt; margin: 0.3rem 0; padding-left: 1.5rem; }
                    .list li { margin-bottom: 4px; }
                    .med-group-title { font-weight: 500; font-size: 9.5pt; margin: 0.8rem 0 0.3rem; }
                    .prescripcion-item { font-size: 9pt; }
                    .indicacion-farmacologica { font-size: 8.5pt; margin-top: 5px; padding-left: 15px; line-height: 1.3; }
                    .med-name { font-weight: 700; }
                    .signature { position: absolute; bottom: 0; width: 90%; text-align: center; font-size: 9pt; }
                    .signature-line { border-top: 1px solid #333; width: 70%; margin: 0 auto 0.2rem; }
                    .form-code { position: absolute; bottom: 0; right: 0; font-size: 8pt; color: #555; }
                }
            `}</style>
            <div className="page-grid">
                {renderColumn('receta')}
                <div className="divider"></div>
                {renderColumn('indicaciones')}
            </div>
        </div>
    );
};

RecetaMedicaPrint.propTypes = {
    atencionId: PropTypes.number.isRequired,
    onPrintFinish: PropTypes.func.isRequired,
};