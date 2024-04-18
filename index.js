const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const app = express();
const morgan = require("morgan");
const connectToMongoDB = require("./config/db");
const path = require("path");
const rfs = require("rotating-file-stream");
const { format } = require("date-fns");
const session = require("express-session");
const passport = require("passport");
const OAuth2Strategy = require("passport-google-oauth2").Strategy;

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectToMongoDB();

// Middleware setup
app.use(express.json());
app.use(cors());



// Morgan setup for logging
const logDirectory = path.join(__dirname, "log");
const accessLogStream = rfs.createStream("access.log", {
  interval: "1d", // rotate daily
  path: logDirectory,
});

// Define a custom token for morgan to display time in Indian Standard Time (IST)
morgan.token("indian-time", () => {
  return format(new Date(), "YYYY-MM-dd HH:mm:ss", {
    timeZone: "Asia/Kolkata",
  });
});

// Define a custom token for the browser information
morgan.token("browser", (req, res) => {
  return req.headers["user-agent"]; // Extract the user agent from the request headers
});

// Setup morgan with custom format including Indian time and browser information
app.use(
  morgan(
    ':remote-addr - - [:indian-time] ":method :url HTTP/:http-version" :status :res[content-length] "-" ":browser"',
    { stream: accessLogStream }
  )
);

require("./src/router/baseRouter")(app);

// ! GOOGLE AUTH SNIPETS

const clientid = "1062156057892-oqukd3of5sdc2vmdb0solhomfu3regdm.apps.googleusercontent.com"
const clientsecret = "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"

passport.use(
  new OAuth2Strategy({
      clientID: clientid,
      clientSecret: clientsecret,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"]
  },
  async (accessToken, refreshToken, profile, done) => {
      try {
          // You can access the accessToken, refreshToken, and profile here
          console.log("Access Token:", accessToken);
          console.log("Refresh Token:", refreshToken);
          console.log("Profile:", profile);

          let user = await userdb.findOne({ googleId: profile.id });

          if (!user) {
              user = new userdb({
                  googleId: profile.id,
                  displayName: profile.displayName,
                  email: profile.emails[0].value,
                  image: profile.photos[0].value
              });

              await user.save();
          }

          return done(null, user);
      } catch (error) {
          return done(error, null);
      }
  })
);


passport.serializeUser((user,done)=>{
  done(null,user);
})

passport.deserializeUser((user,done)=>{
  done(null,user);
});

// initial google ouath login
app.get("/auth/google",passport.authenticate("google",{scope:["profile","email"]}));

app.get("/auth/google/callback",passport.authenticate("google",{
  successRedirect:"http://localhost:5173",
  failureRedirect:"http://localhost:5173/auth/signin"
}))


// Routes setup





module.exports = app;
