import { ExistenciaCostosModel } from '../models/existenciaCostosModel.js';

export class ExistenciaCostosController {
  static async getExistenciaCostos(req, res) {
    // Extraer los parámetros de la solicitud
    const {
      an_cod_empr,
      an_cod_sucu,
      an_cod_bode,
      an_cod_linp,
      an_cod_grpr,
      an_cod_cate,
      an_cod_marc,
      ada_fec,
      as_cod_prod,
      as_cod_pro2,
    } = req.body;

    try {
      // Llamar al modelo para ejecutar el procedimiento almacenado
      const result = await ExistenciaCostosModel.execute({
        an_cod_empr,
        an_cod_sucu,
        an_cod_bode,
        an_cod_linp,
        an_cod_grpr,
        an_cod_cate,
        an_cod_marc,
        ada_fec,
        as_cod_prod,
        as_cod_pro2,
      });

      // Devolver los resultados en formato JSON
      res.status(200).json(result);
    } catch (error) {
      // Manejar errores
      console.error('Error en el controlador:', error);
      res.status(500).json({ error: error.message });
    }
  }
}