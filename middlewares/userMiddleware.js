const jwt = require("jsonwebtoken");
const { userModel } = require("../db");


async function isUser(req, res, next) {
    const token = req.headers.token;

    if (!token) {
        return res.json({ message: "token not provided" });
    }

    try {
        jwt.verify(token, process.env.User_JWT, async function (err, decoded) {
            if (err) {
                return res.json({ message: "invalid token" });
            } else {
                const user = await userModel.findOne({ email: decoded.email });
                if (!user) {
                    return res.json({ message: "No user found" });
                } else {
                    req.id = user._id;
                    next();
                }
            }
        });


    } catch (e) {
        res.json({ e });

    }


}


module.exports = isUser;