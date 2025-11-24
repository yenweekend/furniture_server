const { promisify } = require("util");
const client = require("../databases/init.redis");

const hset = (key, field, value) => client.hSet(key, field, value);
const hget = (key, field) => client.hGet(key, field);
const hdel = (key, field) => client.hDel(key, field);
const hincreby = (key, field, increment) =>
  client.hIncrBy(key, field, increment);
const setnx = (key, value) => client.setNX(key, value);
const exists = (key) => client.exists(key);
const hexists = (key, field) => client.hExists(key, field);
const hgetall = (key) => client.hGetAll(key);
const lrange = (key, start, stop) => client.lrange(key, start, stop);
const increby = (key, increment) => client.incrBy(key, increment);
const get = (key) => client.get(key);
const set = (key, value) => client.set(key, value);
const expire = (key, ttl) => client.expire(key, ttl);
module.exports = {
  hexists,
  expire,
  lrange,
  get,
  set,
  hset,
  hdel,
  exists,
  hgetall,
  setnx,
  increby,
  hget,
  hincreby,
  // cách thủ công để chuyển từ 1 hàm callback-style -> promise style
  // setPromise: async ({ key, value }) => {
  //   return new Promise((isOk, isError) => {
  //     client.set(key, value, (err, rs) => {
  //       return !err ? isOk(rs) : isError(err);
  //     });
  //   });
  // },
};
// cách mới để chuyển từ 1 hàm callback-style -> promise style
// const hset = promisify(client.hSet).bind(client);
// const hget = promisify(client.hGet).bind(client);
// const hincreby = promisify(client.hIncrBy).bind(client);
// const setnx = promisify(client.setNX).bind(client);
// const exists = promisify(client.exists).bind(client);
// const hgetall = promisify(client.hGetAll).bind(client);
// const increby = promisify(client.incrBy).bind(client);
// const get = promisify(client.get).bind(client);
// const set = promisify(client.set).bind(client);
// const lrange = promisify(client.lRange).bind(client);
