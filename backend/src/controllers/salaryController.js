import User from "../models/User.js";

export const setSalary = async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { salary: req.body },
    { new: true }
  );
  res.json(user);
};
