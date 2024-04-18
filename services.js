const bcrypt = require("bcrypt");
const jsonwebtoken = require("jsonwebtoken");
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');

module.exports = {
  createPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  },
  createToken: async (data) => {
    const token = await jsonwebtoken.sign(data, "uj84ur84yr4y98", {
      expiresIn: "3hours",
    });
    return token;
  },
  verifyToken: async (token) => {
    try {
      const verifiedToken = await jsonwebtoken.verify(token, "uj84ur84yr4y98");
      return verifiedToken;
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new Error('Token expired');
      } else {
        throw new Error('Invalid token');
      }
    }
  },
  verify_O_AuthToken:async(accessToken)=>{

    
    const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
    
    passport.use(new GoogleStrategy({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/callback",
      passReqToCallback: true,
    },
    function(request, accessToken, refreshToken, profile, done) {
      return done(null, profile);
    }));
    
    passport.serializeUser(function(user, done) {
      done(null, user);
    });
    
    passport.deserializeUser(function(user, done) {
      done(null, user);
    });
  }
};