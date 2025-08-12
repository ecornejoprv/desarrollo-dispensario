import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

const config = {
  connectionString: process.env.DATABASE_URL,
  // Configuración recomendada del pool:
  max: 10,                 // Máximo de conexiones en el pool
  idleTimeoutMillis: 30000, // Conexiones inactivas se cierran después de 30s
  connectionTimeoutMillis: 5000, // Tiempo máximo para establecer conexión
  allowExitOnIdle: true
}

// Validación básica de la connection string
if (!config.connectionString) {
  throw new Error('DATABASE_URL no está definida en las variables de entorno')
}

export const db = new Pool(config)

// Función para verificar la conexión
export const checkConnection = async () => {
  let client
  try {
    client = await db.connect()
    await client.query('SELECT NOW()')
    console.log('✅ DATABASE connected successfully')
    return true
  } catch (error) {
    console.error('❌ DATABASE connection error:', error.message)
    
    // Detalles específicos para diagnóstico
    if (error.code === 'ENOBUFS') {
      console.error('Error de red: El sistema no tiene suficientes buffers disponibles')
      console.error('Posibles soluciones:')
      console.error('1. Verifica la conectividad de red a la base de datos')
      console.error('2. Aumenta los límites del sistema con: sysctl -w net.ipv4.tcp_mem="..."')
      console.error('3. Reduce el tamaño del pool de conexiones')
    }
    
    return false
  } finally {
    if (client) client.release()
  }
}

// Verificar la conexión al iniciar
checkConnection()

// Manejar errores de conexión inesperados
db.on('error', (err) => {
  console.error('Unexpected error on idle client', err)
  // Puedes agregar lógica para reconectar aquí si es necesario
})