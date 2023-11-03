/* Express */
const express = require('express');
const router = express.Router();

/* Import Schemas */
const Member = require("../schemas/member");

/* Password Protection */
const bcrypt = require('bcrypt');
const saltRounds = 10; // change for higher/lower security requirement

/* Login Protection (JWT) */
const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET; // .env file for secret key (excluded from git)

/* Function to check validity of registration request */
function join_validity_check(nickname, password, password_check) {

    // check nickname
    const regex = /^[A-Za-z0-9]{3,}$/;
    if (!regex.test(nickname)) {
        return 'name fail';
    };

    // check length
    if (password.length < 4) {
        return 'pwd length fail';
    };

    // check nickname match 
    if (password.includes(nickname)) {
        return 'pwd includes nickname';
    };

    // check password_check match
    if (password != password_check) {
        return 'pwd check fail';
    };

    return 'no problem';
}

/* API to register as a member (POST) */
router.post('/register', async (req, res) => {

    const { nickname, password, password_check } = req.body;

    // verify details
    const result = join_validity_check(nickname, password, password_check);
    if (result == 'name fail') {
        res.status(400).json({ success: false, message: "Nickname conditions failed." });

    } else if (result == 'pwd length fail') {
        res.status(400).json({ success: false, message: "Password conditions failed." });

    } else if (result == 'pwd includes nickname') {
        res.status(400).json({ success: false, message: "Password conditions failed." });

    } else if (result == 'pwd check fail') {
        res.status(400).json({ success: false, message: "Passwords do not match." });

    } else { // 'no problem'

        try {
            // search the Members DB for matching nickname
            const namecheck = await Member.findOne({ nickname });
            if (namecheck) {
                return res.status(404).json({ success: false, message: "Nickname Exists" });
            };

            // if name doesn't exist, create one
            const hashedPassword = await bcrypt.hash(password, saltRounds);
            const newMember = await Member.create({ nickname, password: hashedPassword });
            res.status(201).json({ success: true, newMember: { nickname: newMember.nickname } }); // do not return password
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Internal Server Error : Registration Failed." });
        };
    };
});

/* API to Login */
router.post('/login', async (req, res) => {

    const { nickname, password } = req.body;

    try {
        // find the user by nickname
        const user = await Member.findOne({ nickname });
        if (!user) {
            return res.status(401).json({ message: "Check your nickname and password again." });
        }

        // check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Check your nickname and password again." });
        }

        // generate a JWT token
        const token = jwt.sign(
            { userId: user.memberID }, // MongoDB unique value ; instead of nickname of memberID (encoded not encrypted)
            jwtSecret,
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        // send the JWT in a cookie
        res.cookie('token', token, { httpOnly: true })
            .json({ message: "Login Successful." });

        // later with https (secure flag)
        // res.cookie('token', token, { httpOnly: true, secure: true, sameSite: 'strict' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error : Login Failed." });
    }
});

/* Export router */
module.exports = router;