import express from 'express';
import { informixDb } from '../database/databaseInformix.js'; // Asegúrate de importar la conexión a la base de datos

const router = express.Router();

// Endpoint de prueba
router.get('/test-query', async (req, res) => {
  const query = `SELECT * FROM saeprod LIMIT 10`; // Consulta simple

  try {
    console.log('Ejecutando consulta de prueba...');
    const result = await informixDb.query(query);
    console.log('Consulta ejecutada correctamente:', result);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error en la consulta de prueba:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;