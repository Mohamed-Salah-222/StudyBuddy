const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const User = require("../models/user");
const jwt = require("jsonwebtoken");

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          done(null, user);
        } else {
          const newUser = new User({
            username: profile.displayName,
            email: profile.emails[0].value,

            password: "google-auth-user",
          });

          await newUser.save();

          done(null, newUser);
        }
      } catch (error) {
        done(error, null);
      }
    }
  )
);
