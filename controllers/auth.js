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
        const token = jwt.sign({ email: result.email, id: result._id }, process.env.JWT_SECRET, { expiresIn: "1h" });
        res.status(200).json({ result, token });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}