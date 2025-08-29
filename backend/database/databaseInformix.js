import 'dotenv/config';
import odbc from 'odbc';

const connectionString = `
  DRIVER={IBM INFORMIX ODBC DRIVER (64-bit)};
  SERVER=${process.env.INFORMIX_SERVER};
  DATABASE=${process.env.INFORMIX_DATABASE};
  HOST=${process.env.INFORMIX_HOST};
  SERVICE=${process.env.INFORMIX_PORT};
  PROTOCOL=onsoctcp;
  UID=${process.env.INFORMIX_USER};
  PWD=${process.env.INFORMIX_PASSWORD};
  CLIENT_LOCALE=en_US.819;
  DB_LOCALE=en_US.819;
  DELIMIDENT=Y;
  CONNECTION_TIMEOUT=30;
  LOGIN_TIMEOUT=30;
`;

// Configurar pool de conexiones
const poolConfig = {
  connectionString: connectionString,
  connectionTimeout: 30,
  loginTimeout: 30,
  initialSize: 1,
  maxSize: 10,
  incrementSize: 1
};

export const informixDb = {
  pool: await odbc.pool(connectionString),

  
  // Método para verificar la conexión
  async testConnection() {
    let conn;
    try {
      conn = await this.pool.connect();
      console.log('✅ Conexión a Informix verificada correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al conectar a Informix:', error);
      return false;
    } finally {
      if (conn) await conn.close();
    }
  }
};

// Verificar conexión al iniciar
informixDb.testConnection();