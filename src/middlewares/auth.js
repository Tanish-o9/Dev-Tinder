const jwt = require("jsonwebtoken");
const user = require("../models/user");
const authMiddle = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(401).json({ message: "Authentication required" });
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);
    const findUser = await user.findById(_id);
    if (!findUser) return res.status(401).json({ message: "Session expired, please log in again" });
    req.user = findUser;
    next();
  } catch (error) {
    const isJwtError = error.name === "JsonWebTokenError" || error.name === "TokenExpiredError";
    res.status(isJwtError ? 401 : 400).json({ message: isJwtError ? "Session expired, please log in again" : error.message });
  }
};
module.exports = { authMiddle };
