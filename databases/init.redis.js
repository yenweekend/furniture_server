require("dotenv").config();
// const { REDIS_ENDPOINT_URL, REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } =
//   process.env;
// const redisEndpointUri = REDIS_ENDPOINT_URL
//   ? REDIS_ENDPOINT_URL.replace(/^(redis\:\/\/)/, "")
//   : `${REDIS_HOST}:${REDIS_PORT}`;
// const redisClient = redis.createClient(`redis://${redisEndpointUri}`, {
//   password: REDIS_PASSWORD,
// });
const { createClient } = require("redis");
const client = createClient({
  url: process.env.REDIS_URL,
});
(async () => {
  await client.connect();
})();

client.on("connect", () => console.log("::> Redis Client Connected"));
client.on("error", (err) => console.log("<:: Redis Client Error", err));

// client.ping(function (err, result) {
//   console.log(result);
// });

// client.on("connect", () => {
//   console.log("Redis client connected");
// });

// client.on("error", (error) => {
//   console.log(error);
// });
module.exports = client;
