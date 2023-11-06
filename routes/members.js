// routes/members.js

/* Express */
const express = require('express');
const router = express.Router();

/* Import Models */
const { Member } = require("../models/index");

/* Password Protection */
const bcrypt = require('bcrypt');
const saltRounds = 10; // change for higher/lower security requirement

/* Login Protection (JWT) */
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // JWT Secret Key in .env file (excluded from git)

/* Function to check validity of registration request */
function join_validity_check(nickname, password, password_check) {

    // Return error messages if condition is triggered
    const regex = /^[A-Za-z0-9]{3,}$/;
    if (!regex.test(nickname)) {
        return "Nickname must be at least 3 characters long and contain only alphanumeric characters.";
    }
    if (password.length < 4) {
        return "Password must be at least 4 characters long.";
    }
    if (password.includes(nickname)) {
        return "Password cannot include the nickname.";
    }
    if (password !== password_check) {
        return "Passwords do not match.";
    }

    return null; // null indicates no errors
}

/* API to register as a member (POST) */
router.post('/register', async (req, res) => {

    // Dereference input from the http request body
    const { nickname, password, password_check } = req.body;

    // Verify that the entries are valid
    const validationError = join_validity_check(nickname, password, password_check);
    if (validationError) {
        res.status(400).json({ success: false, message: validationError });

    } else {

        try {
            // Verify that the name is not taken
            const namecheck = await Member.findOne({ where: { nickname } });
            if (namecheck) {
                return res.status(409).json({ success: false, message: "Nickname Exists" });
            };

            // Hash the password entry and create membership
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newMember = await Member.create({ nickname, password: hashedPassword });

            // Return result to the user (include memberID ; PK to that model)
            res.status(201).json({ success: true, newMember: { memberID: newMember.memberID, nickname: newMember.nickname } });

        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Internal Server Error : Registration Failed." });
        };
    };
});

/* API to Login */
router.post('/login', async (req, res) => {

    // Dereference input from http request body
    const { nickname, password } = req.body;

    try {
        // find the user by nickname
        const user = await Member.findOne({ where: { nickname } });
        if (!user) {
            return res.status(401).json({ success: false, message: "Check your nickname and password again." });
        }

        // check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: "Check your nickname and password again." });
        }

        // generate a JWT token
        const token = jwt.sign(
            { userId: user.memberID }, // memberID is the PK of the Member model
            jwtSecret,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // send the JWT in a cookie
        res.cookie('token', token, { httpOnly: true })
            .json({ success: true, message: "Login Successful." });

        // later with https (secure flag)
        // res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Login Failed." });
    }
});

/* Export router */
module.exports = router;