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
const superAdminSchema = require("./src/model/superAdminModel");
const services = require("./services");

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectToMongoDB();

// Middleware setup
app.use(express.json());
app.use(cors());

// setup session
app.use(
  session({
    secret: "yy74y4r47yr474yr4y4",
    resave: false,
    saveUninitialized: true,
  })
);

// setuppassport
app.use(passport.initialize());
app.use(passport.session());

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

let user;

const clientid = process.env.GOOGLE_CLIENT_ID
const clientsecret = process.env.GOOGLE_CLIENT_SECRET;

passport.use(
  new OAuth2Strategy(
    {
      clientID: clientid,
      clientSecret: clientsecret,
      callbackURL: "/auth/google/callback",
      scope: ["profile", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
    
        const count = await superAdminSchema.countDocuments();

         user = await superAdminSchema.findOne({
          googleId: profile.id
        });

        if (!user) {
          user = new superAdminSchema({
            googleId: profile.id,
            username: profile.displayName,
            email: profile.emails[0].value,
            profilePic: profile.photos[0].value,
          Super_Admin_id: `Super_admin_${count + 1}`,
          });

          await user.save();
        }
console.log(user);

        return done(null, user);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

// Middleware to attach user data to response object
async function attachUserData(req, res, next) {
  if (req.user) {
    // If user is authenticated, attach user data to response locals
    res.locals.user = req.user;
  }
  next();
}

// Attach middleware to every request
app.use(attachUserData);

// Route handler for the home page
app.get("/", async(req, res) => {
  // Check if user data is available in locals
console.log(user);
  if (user) {

    const {_id,Super_Admin_id,email,designation} = user;

    // If user data is available, send it to the client
    const token =  await services.createToken({_id:_id,Super_Admin_id:Super_Admin_id,email:email,designation:designation});
    console.log(token);
    res.send({ user,token});
  } else {
    // If user data is not available, send a generic response
    res.send("Welcome to the home page");
  }
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// initial google ouath login
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "http://localhost:5173/super-admin/dashboard",
    failureRedirect: "http://localhost:5173/auth/signin",
  })

  
);

// Routes setup

module.exports = { app };
