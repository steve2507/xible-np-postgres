'use strict';

module.exports = (NODE) => {
  const { Client: PostgresClient } = require('pg');
  let client;
  let clientConnected = false;

  const postgresOut = NODE.getOutputByName('postgres');
  postgresOut.on('trigger', async (conn, state, callback) => {
    if (!client) {
      client = new PostgresClient({
        host: NODE.data.host,
        port: NODE.data.port,
        database: NODE.data.database,
        user: NODE.data.user,
        password: NODE.data.password
      });

      client.on('error', (err) => {
        NODE.addStatus({
          message: err.toString(),
          color: 'red',
          timeout: 10000
        });
      });

      client.on('end', () => {
        clientConnected = false;

        NODE.removeAllStatuses();
        NODE.addStatus({
          message: 'disconnected',
          color: 'red'
        });
      });
    }

    if (!clientConnected) {
      await client.connect();
      clientConnected = true;

      NODE.removeAllStatuses();
      NODE.addStatus({
        message: 'connected',
        color: 'green'
      });
    }

    callback(client);
  });
};
