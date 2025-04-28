const express = require("express");
const User = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const { authMiddleware, adminMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// CREATE (admin manually creating user)
router.post("/", async (req, res) => {
    try {
        const { fullName, email, password, contactNumber, role, restaurantName, restaurantAddress } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userData = {
            fullName,
            email,
            password: hashedPassword,
            contactNumber,
            role,
            isApproved: true // Admin-created users are approved directly
        };

        // Add restaurant information if role is restaurant manager
        if (role === "restaurantManager") {
            if (!restaurantName || !restaurantAddress) {
                return res.status(400).json({ 
                    error: "Restaurant name and address are required for restaurant managers" 
                });
            }
            
            userData.restaurantInfo = {
                name: restaurantName,
                address: restaurantAddress
            };
        }

        const user = new User(userData);
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
                restaurantInfo: user.restaurantInfo,
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

        // Check if user is already approved
        if (user.isApproved) {
            return res.status(400).json({ error: "User is already approved" });
        }

        user.isApproved = true;
        await user.save();

        res.status(200).json({ 
            status: true,
            message: "User approved successfully",
            user: {
                _id: user._id,
                isApproved: user.isApproved
            }
        });
    } catch (error) {
        console.error("Error approving user:", error);
        res.status(500).json({ 
            status: false,
            error: "Internal Server Error",
            message: error.message 
        });
    }
});

// UPDATE user
router.put("/:id", async (req, res) => {
    try {
        const { fullName, email, password, contactNumber, role, restaurantName, restaurantAddress } = req.body;

        const updateFields = { fullName, email, contactNumber, role };

        if (password) {
            updateFields.password = await bcrypt.hash(password, 10);
        }

        // Update restaurant information if provided and role is restaurant manager
        if (role === "restaurantManager") {
            if (restaurantName || restaurantAddress) {
                updateFields.restaurantInfo = {};
                
                if (restaurantName) {
                    updateFields.restaurantInfo.name = restaurantName;
                }
                
                if (restaurantAddress) {
                    updateFields.restaurantInfo.address = restaurantAddress;
                }
            }
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

// Get token
router.get('/token', authMiddleware, async (req, res) => {
    try {
      res.status(200).json({ token: req.token });
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch token' });
    }
});

// Get user profile (for token verification)
router.get('/profile', authMiddleware, async (req, res) => {
    try {
      res.status(200).json({ 
        status: true,
        user: req.user 
      });
    } catch (error) {
      res.status(500).json({ 
        status: false,
        message: error.message 
      });
    }
});

module.exports = router;