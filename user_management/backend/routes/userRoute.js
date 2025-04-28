const express = require("express");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// CREATE (admin manually creating user)
router.post("/", async (req, res) => {
    try {
        const { fullName, email, password, contactNumber, role } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            contactNumber,
            role,
            isApproved: true // Admin-created users are approved directly
        });

        await user.save();

        res.status(201).json({
            status: true,
            message: "User created successfully!",
            user: {
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
                role: user.role,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        console.error("Error creating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// READ all users
router.get("/", async (req, res) => {
    try {
        const users = await User.find().select("-password");
        res.status(200).json(users);
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Approve a user
router.put("/:id/approve", authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.isApproved = true;
        await user.save();

        res.status(200).json({ message: "User approved successfully" });
    } catch (error) {
        console.error("Error approving user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// UPDATE user
router.put("/:id", async (req, res) => {
    try {
        const { fullName, email, password, contactNumber, role } = req.body;

        const updateFields = { fullName, email, contactNumber, role };

        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            updateFields,
            { new: true }
        ).select("-password");

        if (!updatedUser) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// DELETE user
router.delete("/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        res.status(200).json({ message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
