export const isStaff = (req, res, next) => {
  if (req.user.role !== "staff") {
    return res.status(403).json({ msg: "Access denied" });
  }
  next();
};