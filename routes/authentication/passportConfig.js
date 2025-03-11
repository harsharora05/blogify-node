const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const { userModel } = require("../../db.js");

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3001/user/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await userModel.findOne({ googleId: profile.id });

        if (!user) {
            user = await userModel.create({
                googleId: profile.id,
                name: profile.displayName,
                email: profile.emails[0].value,
            });

        }
        return done(null, user);
    } catch (err) {
        return done(err, null);
    }
}));


module.exports = passport