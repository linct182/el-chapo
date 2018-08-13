const passport = require('passport');
const Users = require('../models').users;
const secret = require('../config/config.json')['secret'];
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require ('passport-local');

//Create local strategy
const localOptions = { usernameField: 'email' };
const localLogin = new LocalStrategy({ usernameField: 'username' }, (username, password, done) => {
// Verify this email and password, call done with the user
// if it is the correct email and password
// otherwise, call done with false
  Users.findOne({ where: { username: username, is_verified: true }, attributes: ['id', ['user_type_id', 'user_type'], 'password', 'username', 'email']})
    .then( user => {
      if(!user) {
        return done(null, false);
      }

      // compare passwords - is `password` equal to user.password
      Users.comparePassword(password, user.password, (error, isMatch) => {
        if(error){ return done(error); }
        if(!isMatch){ return done(null, false); }

        return done(null, user);
      });

    })
    .catch( error => {
      return done(error);
    });

});

// Setup options for JWT Startegy
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: secret
};

// Create JWT strategy
const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  // See if the user ID in the payload exists in our database
  //If it does, call 'done' with that other
  // otherwise, call done without a user object

  Users.findById(payload.sub)
    .then(user => {
      if(user) {
        done(null, user);
      } else {
        done(null, false);
      }
    })
    .catch(error => {
      return done(error, false);
    });
});

// Tell passport to use startegy
passport.use(jwtLogin);
passport.use(localLogin);