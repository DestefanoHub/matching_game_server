export default {
  mongodbMemoryServerOptions: {
    binary: {
      version: '7.1.1',
      skipMD5: true,
    },
    instance: {
      dbName: 'matching-game-test',
    },
    autoStart: false,
  },
};