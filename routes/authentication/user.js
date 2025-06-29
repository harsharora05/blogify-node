const { Router } = require("express");
const { userModel } = require("../../db.js");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const bcrypt = require("bcrypt");
const isUser = require("../../middlewares/userMiddleware.js");
// const { use } = require("passport");
// const passport = require("passport");







const userRouter = Router();



userRouter.post("/signUp", async function (req, res) {
    console.log(req.body);

    const userSchema = z.object({
        name: z.string(),
        username: z.string().min(4, "Minimum length should be 4").max(25, "Maximum length should be 25"),
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

userRouter.use(isUser);

userRouter.post('/changePassword', async function (req, res) {

    const userId = req.id;
    const passSchema = z.object({
        oldPassword: z.string(),
        newPassword: z.string().min(8, "Minimum Length should be 8").regex(/[A-Z]/, "should contain one capital letter").regex(/[0-9]/, "Should contain one numeric letter").regex(/[@#$%^&*]/, "should contain 1 special character"),
        confirmNewPassword: z.string().min(8, "Minimum Length should be 8").regex(/[A-Z]/, "should contain one capital letter").regex(/[0-9]/, "Should contain one numeric letter").regex(/[@#$%^&*]/, "should contain 1 special character")
    });

    try {



        const passValidation = passSchema.safeParse(req.body);

        if (!passValidation.success) {
            return res.status(400).json({ "message": passValidation.error.issues[0].message });
        }

        if (passValidation.data.newPassword !== passValidation.data.confirmNewPassword) {
            return res.status(400).json({ "message": "New Passwords Don't Match" })
        }


        const user = await userModel.findOne({ _id: userId });

        const oldPassCompare = await bcrypt.compare(passValidation.data.oldPassword, user.password);

        if (oldPassCompare) {
            const newOldPassCompare = await bcrypt.compare(passValidation.data.newPassword, user.password);
            if (!newOldPassCompare) {


                const hashedPass = await bcrypt.hash(passValidation.data.newPassword, 5)
                const updatePass = await userModel.findByIdAndUpdate(userId, { password: hashedPass });
                if (updatePass) {
                    return res.status(200).json({ "message": "Password change Successfully" })
                }
            } else {
                res.status(400).json({ "message": "New & Old Password Cant't Be Same" });
            }

        } else {
            res.status(400).json({ "message": "Old Password Incorrect" });
        }

    } catch (e) {

        res.status(500).json({ "message": "Something Went Wrong" });
    }







});















module.exports = userRouter;