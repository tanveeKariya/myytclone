import mongoose from "mongoose";
import User from "../models/auth.js"; 

export const updateUserPoints = async (req, res) => {
  const { userId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).send("User not found.");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.points += 5;
    await user.save();

    res.json({ message: 'User points updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Unable to update user points', error: error.message });
  }
};


export const getPoints = async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(404).send("User not found");
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("User not found");
    }

    res.status(200).json({ points: user.points });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};