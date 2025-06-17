const { Router } = require("express");
const { userModel } = require("../../db.js");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const passport = require("passport");







const userRouter = Router();



userRouter.post("/signUp", async function (req, res) {
    console.log(req.body);

    const userSchema = z.object({
        name: z.string().min(4, "Minimum length of username should be 4").max(25, "Maximum length should be 25"),
        username: z.string(),
        email: z.string().email("not a valid email"),
        password: z.string().min(8, "Minimum Length should be 8").regex(/[A-Z]/, "should contain one capital letter").regex(/[0-9]/, "Should contain one numeric letter").regex(/[@#$%^&*]/, "should contain 1 special character"),
        confirmPassword: z.string()
    }).strict();

    try {

        if (req.body.password != req.body.confirmPassword) {
            return res.status(400).json({ message: "Passwords don't match" });
        }

        const userValidation = userSchema.safeParse(req.body);
        if (!userValidation.success) {
            res.status(400).json({ message: userValidation.error.issues[0].message });
        }
        else {
            let hashedPass = await bcrypt.hash(req.body.password, 5);
            let response = await userModel.create({
                name: req.body.name,
                username: req.body.username,
                email: req.body.email,
                mobile: req.body.mobile,
                password: hashedPass,
            });

            if (response) {
                console.log(response);

                res.status(200).json({ "message": " SignUp Successfull" });
            }
        }

    } catch (e) {
        let key = Object.keys(e.keyValue)[0];
        console.log(e);

        res.status(400).json({
            "message": `${key} is already taken`
        });
    }


});


userRouter.post("/signIn", async function (req, res) {
    try {


        const userSchema = z.object({
            email: z.string().email("not a valid email"),
            password: z.string()
        }).strict();

        const userValidation = userSchema.safeParse(req.body);

        if (!userValidation.success) {
            return res.status(400).json({ message: userValidation.error.issues[0].message });
        } else {
            const userF = await userModel.findOne({ email: req.body.email });

            if (!userF) {
                return res.status(400).json({ message: "User doesn't exists! Check credntials" });
            }
            else {
                const result = await bcrypt.compare(userValidation.data.password, userF.password);
                if (result == false) {
                    return res.status(400).json({ message: "Check Credentials" });
                } else {
                    const token = jwt.sign({ email: userF.email }, process.env.User_JWT);

                    return res.status(200).json({
                        message: "Signin successfull",
                        token: token,
                        username: userF.username,
                        email: userF.email
                    });
                }
            }

        }

    } catch (e) {
        console.log(e);
        res.status(500);
    }




});















module.exports = userRouter;