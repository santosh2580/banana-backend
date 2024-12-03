const { promisify } = require("util");
const jwt = require("jsonwebtoken");
const Player = require("./../models/playerModel");
const errorHandler = require("./../utilities/errorHandler");
const AppError = require("./../utilities/appError");

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET_CODE, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),

    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
  user.password = undefined;
  res.status(statusCode).json({
    status: "success",
    token,
    data: { user },
  });
};

// user sign-in here.
exports.register = errorHandler(async (req, res) => {
  const newPlayer = await Player.create({
    name: req.body.name,
    mail: req.body.mail,
    password: req.body.password,
  });
  createSendToken(newPlayer, 201, res);
});

// Users login here.
exports.authenticate = errorHandler(async (req, res, next) => {
  const { mail, password } = req.body;

  // check email and password
  if (!mail || !password) {
    return next(new AppError("Please include mail id and password."));
  }

  // check if user is in database and password sis correct
  const player = await Player.findOne({ mail }).select("+password");
  console.log(player, " the player");
  if (
    !player ||
    !(await player.correctPlayerPassword(password, player.password))
  ) {
    return next(new AppError("Incorrect mail id and password", 401));
  }

  // if all ok
  createSendToken(player, 200, res);
});

// To access data only after login
exports.authorize_field = errorHandler(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access.", 401)
    );
  }

  const decoded = await promisify(jwt.verify)(
    token,
    process.env.JWT_SECRET_CODE
  );
  const currentUser = await Player.findById(decoded.id);
  if (!currentUser)
    return next(
      new AppError(
        "The user belonging to this token does no longer exist.",
        401
      )
    );

  req.user = currentUser;
  next();
});
