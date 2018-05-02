'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const postgresIn = NODE.getInputByName('postgres');

  const doneOut = NODE.getOutputByName('done');
  const rowsOut = NODE.getOutputByName('rows');

  triggerIn.on('trigger', async (conn, state) => {
    const postgress = await postgresIn.getValues(state);

    try {
      const rowsPerPostgres = await Promise.all(postgress.map(async (postgres) => {
        const result = await postgres.query(NODE.data.query);
        return result.rows;
      }));


      const rows = [].concat(
        ...rowsPerPostgres
        .filter(rowsPp => rowsPp !== undefined && rowsPp !== null)
      );
      state.set(NODE, {
        rows
      });

      doneOut.trigger(state);
    } catch (err) {
      NODE.error(err, state);
    }
  });

  rowsOut.on('trigger', (conn, state, callback) => {
    const thisState = state.get(NODE);
    if (!thisState || !thisState.rows) {
      return;
    }

    callback(thisState.rows);
  });
};
