const { Sequelize } = require("sequelize");

const sequelize = new Sequelize("baya_v3", "postgres", "250204", {
  host: "127.0.0.1", // hoặc "localhost"
  port: 5432, // mặc định của PostgreSQL
  dialect: "postgres",
  timezone: "+07:00",
  dialectOptions: {
    ssl: false, // local không dùng SSL
    charset: "utf8",
    useUTC: false,
    dateStrings: true,
  },
  logging: false, // tắt log SQL
  define: {
    charset: "utf8",
    collate: "utf8_general_ci",
  },
});

const dbConn = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
};
module.exports = { sequelize, dbConn };
