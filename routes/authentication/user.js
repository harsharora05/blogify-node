const { Router } = require("express");
const { userModel } = require("../../db.js");
const jwt = require("jsonwebtoken");
const { z } = require("zod");
const bcrypt = require("bcrypt");
// const passport = require("passport");



const userRouter = Router();



userRouter.post("/signUp", async function (req, res) {

    const userSchema = z.object({
        name: z.string().min(4, "Minimum length of username should be 4").max(25, "Maximum length should be 25"),
        username: z.string(),
        email: z.string().email("not a valid email"),
        password: z.string().min(8, "Minimum Length should be 8").regex(/[A-Z]/, "should contain one capital letter").regex(/[0-9]/, "Should contain one numeric letter").regex(/[@#$%^&*]/, "should contain 1 special character"),
        confirmPassword: z.string()
    }).strict();

    try {

        if (req.body.password != req.body.confirmPassword) {
            return res.json({ message: "Passwords don't match" });
        }

        const userValidation = userSchema.safeParse(req.body);
        if (!userValidation.success) {
            res.json({ message: userValidation.error.issues[0].message });
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
                res.json({ message: "user signUp successfull" });
            }
        }

    } catch (e) {
        let key = Object.keys(e.keyValue)[0];
        console.log(e);

        res.json({
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
            return res.json({ message: userValidation.error.issues[0].message });
        } else {
            const userF = await userModel.findOne({ email: req.body.email });

            if (!userF) {
                return res.json({ message: "User doesn't exists! Check credntials" });
            }
            else {
                const result = await bcrypt.compare(userValidation.data.password, userF.password);
                if (result == false) {
                    return res.json({ message: "Check Credentials" });
                } else {
                    const token = jwt.sign({ email: userF.email }, process.env.User_JWT);

                    return res.json({
                        message: "sign in successfull",
                        token: token
                    });
                }
            }

        }

    } catch (e) {
        console.log(e);
    }




});




/*
Implemented Otp auth messagaing services using twilio only to understand ... But its paid So when in production we can add rate limiting,on a succesfull  verification  we can save this number to db and another route which will take username from the user and set it into db 

userRouter.post("/start-verify", async function (req, res) {



    const mobSchema = z.object({
        mobile: z.string().regex(/^\d{10}$/, "Enter valid mobile number")
    });

    mobValidation = mobSchema.safeParse(req.body);

    if (!mobValidation.success) {
        return res.json({ message: mobValidation.error.format() })
    }

    try {
        const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        verification = await client.verify.v2.services(process.env.TWILIO_VERIFY)
            .verifications
            .create({ to: `+91${mobValidation.data.mobile}`, channel: 'sms' });

        console.log(verification);

        if (verification) {
            return res.json({
                message: "Otp sent!"
            });
        }

    } catch (e) {
        console.log(e);
        return res.json(
            e.status == 403 ? { message: "Mobile Number Not valid" } : { message: e.status }
        )

    }
});


userRouter.post("/check-verify", async function (req, res) {

    const otpSchema = z.object({
        otp: z.string().regex(/^\d{6}$/, "Enter valid Otp"),
        mobile: z.string().regex(/^\d{10}$/, "Enter valid mobile number")
    });

    const otpValidation = otpSchema.safeParse(
        req.body
    );

    if (!otpValidation.success) {
        return res.json({
            message: otpValidation.error.format()
        });
    }


    try {

        const accountSid = process.env.TWILIO_SID;
        const authToken = process.env.TWILIO_TOKEN;
        const client = require('twilio')(accountSid, authToken);

        const verification_check = await client.verify.v2.services(process.env.TWILIO_VERIFY)
            .verificationChecks
            .create({ to: `+91${otpValidation.data.mobile}`, code: `${otpValidation.data.otp}` })

        // console.log(verification_check);

        if (verification_check.status === "approved") {
            res.json({
                message: "Verification Sucessfull"
            });
        } else {
            res.json({
                message: "Incorrect otp"
            })
        }


    } catch (e) {
        console.log(e);

        res.json({
            message: "Try again Some error occured"
        });

    }

})
*/











module.exports = userRouter;