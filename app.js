const playerRouter = require("./routes/playerRoute");

const AppError = require("./utilities/appError");

const HandleGlobalError = require("./controllers/errorController");
const express = require("express");
const morgan = require("morgan");
const app = express();
const cors = require("cors");

app.use(express.json());

const corsOptions = {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

app.use(express.static(`${__dirname}/public`));

app.use("/banana/player", playerRouter);

app.all("*", (req, res, next) => {
  next(new AppError(`${req.originalUrl} does not exist on this server.`));
});

app.use(HandleGlobalError);

module.exports = app;
