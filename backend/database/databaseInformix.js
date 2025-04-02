import 'dotenv/config';
import odbc from 'odbc';

// const connectionString = `
//   DRIVER={IBM INFORMIX ODBC DRIVER};
//   SERVER=${process.env.INFORMIX_SERVER};
//   DATABASE=${process.env.INFORMIX_DATABASE};
//   HOST=${process.env.INFORMIX_HOST};
//   SERVICE=${process.env.INFORMIX_PORT};
//   PROTOCOL=onsoctcp;
//   UID=${process.env.INFORMIX_USER};
//   PWD=${process.env.INFORMIX_PASSWORD};
// `;

// export const informixDb = await odbc.connect(connectionString);

// try {
//   console.log('Informix DATABASE connected');
// } catch (error) {
//   console.log(error);
// }