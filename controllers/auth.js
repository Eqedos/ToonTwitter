import bcrpyt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user';

// Register

export const register = async (req, res) => {
    try {
        const { firstName, lastName, email, password, confirmPassword, town, characterClass } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: "User already exists" });
        if (password !== confirmPassword) return res.status(400).json({ message: "Passwords don't match" });
        const hashedPassword = await bcrpyt.hash(password, 12);
        const result = await User.create({ firstName, lastName, email, password: hashedPassword, town, characterClass });
        const token = jwt.sign({ id: result._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ result, token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "User doesn't exist" });

        const isPasswordCorrect = await bcrpyt.compare(password, user.password);
        if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid credentials" });
        const token = jwt.sign({id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        delete user.password;
        res.status(200).json({ result: user, token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};