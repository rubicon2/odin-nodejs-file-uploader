import dbEmailStrategy from './dbEmailStrategy.mjs';
import prisma from '../db/prisma.mjs';
import passport from 'passport';

function init() {
  passport.use('local', dbEmailStrategy);

  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          id: id,
        },
      });
      // Choose what user fields we want stored in the session here.
      return done(null, {
        id: user.id,
        email: user.email,
      });
    } catch (error) {
      done(error);
    }
  });

  return passport;
}

export default init;
