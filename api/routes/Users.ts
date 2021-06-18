import express from "express";
import GeneralMiddleware from "../middlewares/GeneralMiddleware";
const Users = express.Router();
Users.use(GeneralMiddleware);
Users.get("/", async (req, res) => {
  res.status(200).json({ banane: 1 });
});
export default Users;
