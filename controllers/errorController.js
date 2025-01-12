const AppError = require("./../utilities/appError");

const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;

  return new AppError(message, 400);
};

const handleJWTExpiredErr = () =>
  new AppError("Your token has expired! Please log in again.", 401);

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  const message = `Invalid input data. ${errors.join(". ")}`;
  console.log(`"so here is the message:" ${message}`);
  return new AppError(message, 400);
};

const handleDuplicateFieldsDB = (err) => {
  const value = err.keyValue.name;

  const message = `Duplicate field value: ${value}. Please use another value.`;

  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError("Invalid token, Please log in again!", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  console.log(err.isOperation);
  console.log(err.message);
  console.log(err);
  if (err.isOperation) {
    res.status(err.statusCode).json({
      status: "failed",
      error: err,
      message: err.message,
      operational: true,
    });
  } else {
    res.status(500).json({
      status: "error",
      error: err,
      message: err.message,
      operational: false,
    });
    console.log(
      "Production enabled & response is delivered. False operational"
    );
  }
};

module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error);

    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredErr();

    sendErrorProd(error, res);
  }
};
