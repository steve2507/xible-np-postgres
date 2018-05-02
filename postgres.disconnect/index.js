'use strict';

module.exports = (NODE) => {
  const triggerIn = NODE.getInputByName('trigger');
  const postgresIn = NODE.getInputByName('postgres');

  const doneIn = NODE.getOutputByName('done');

  triggerIn.on('trigger', async (conn, state) => {
    const postgress = await postgresIn.getValues(state);

    await Promise.all(postgress.map(postgres => postgres.end()));
    doneIn.trigger(state);
  });
};
