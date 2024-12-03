const errorHandler = (fn) => {
  return (req, res, next) => {
    console.log(req.body);
    fn(req, res, next).catch((err) => next(err));
  };
};

module.exports = errorHandler;
