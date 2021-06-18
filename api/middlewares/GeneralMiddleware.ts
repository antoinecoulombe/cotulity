import express = require("express");
const GeneralMiddleware = express.Router();
GeneralMiddleware.use("/", async (req: any, res, next) => {
  if (!req.banana) {
    next(new Error("Where's my banana"));
  }
  next();
});
export default GeneralMiddleware;
