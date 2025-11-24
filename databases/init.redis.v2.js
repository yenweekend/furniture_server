const { createClient } = require("redis");

let client = {},
  statusConnection = {
    CONNECT: "connect",
    END: "end",
    RECONNECT: "reconnect",
    ERROR: "error",
  };

const handleEventConnection = ({ connectionRedis }) => {
  connectionRedis.on(statusConnection.CONNECT, () => {
    console.log("connectionRedis - connection status: connected");
  });
  connectionRedis.on(statusConnection.END, () => {
    console.log("connectionRedis - connection status: ended");
  });
  connectionRedis.on(statusConnection.RECONNECT, () => {
    console.log("connectionRedis - connection status: reconnecting");
  });
  connectionRedis.on(statusConnection.ERROR, () => {
    console.log(`connectionRedis - connection status: error - ${error}`);
  });
};

const initRedis = () => {
  const instanceRedis = createClient({ config });
  client.instanceConnect = instanceRedis;
  handleEventConnection({ connectionRedis: instanceRedis });
};
const getRedis = () => client;
const closeRedis = async () => {
  if (client.instanceConnect) {
    try {
      await client.instanceConnect.quit();
      console.log("Redis connection closed successfully.");
    } catch (error) {
      console.error("Error while closing Redis connection:", error);
    }
  } else {
    console.log("No Redis connection to close.");
  }
};

module.exports = {
  initRedis,
  getRedis,
  closeRedis,
};
