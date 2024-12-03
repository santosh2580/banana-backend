const mongoose = require("mongoose");
const dotenv = require("dotenv");

process.on("uncaughtException", (err) => {
  console.log("Shutting Down Due to Uncaught Exception");
  console.log(err);

  process.exit(1);
});

dotenv.config({ path: "./config.env" });

const app = require("./app");

const DB = process.env.DATABASE.replace(
  "<db_password>",
  process.env.DATABASE_PASSWORD
);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
  })
  .then((con) => {
    console.log("DB Connectionn successful!");
  })
  .catch((err) => {
    console.log("DB Connection unsuccesful!");
    console.log(err);
  });

const port = process.env.APP_PORT || 4000;

const server = app.listen(port, () => {
  console.log(`App running on port ${port}`);
});

process.on("unhandledRejection", (err) => {
  console.log(err.name);
  console.log(err.message);
  console.log("this is Unhandled Rejection & Server is shutting down...");

  server.close(() => {
    process.exit(1);
  });
});
