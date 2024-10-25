import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";

export const signup = async (req, res) => {
  try {
    const { fullName, username, email, password } = req.body;

    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/;
    if (emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(400).json({ error: "Username is already exist" });
    }

    const existingEmail = await User.findOne({ email });

    if (existingEmail) {
      return res.status(400).json({ error: "Email is already exist" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters long" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      fullName,
      username,
      email,
      password: hashedPassword,
    });

    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      return res.status(200).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        converImg: newUser.coverImg,
        profileImg: newUser.profileImg,
      });
    } else {
      return res.status(400).json({ error: "Invalid User Data" });
    }
  } catch (error) {
    console.log("error in signup controller", error.message);
    return res.status(500).json({ error: "Invalid Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password || ""
    );

    if (!(isPasswordCorrect && user)) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    generateTokenAndSetCookie(user._id, res);

    return res.status(200).json({
      id: user._id,
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      converImg: user.coverImg,
      profileImg: user.profileImg,
    });
  } catch (error) {
    console.log("error in signup controller", error.message);
    return res.status(500).json({ error: "Invalid Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.cookie("jwt", "", {maxAge: 0});
    return res.status(200).json({message: "logout successfully"});
  } catch (error) {
    console.log('Error in logout controller', error.message);
    return res.status(500).json({error: "Invalid Server Error"});
  }
};

export const getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        return res.status(200).json(user);
    } catch (error) {
        console.log('Error in getuser controller', error.message);
        return res.status(500).json({error: "Invalid Server Error"});
    }
}