import prisma from '../db/prisma.mjs';
import LocalStrategy from 'passport-local';
import bcryptjs from 'bcryptjs';

const dbEmailStrategy = new LocalStrategy.Strategy(
  { usernameField: 'email' },
  async (username, password, done) => {
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: username,
        },
      });

      if (!user) {
        const msgJSON = JSON.stringify({
          path: 'email',
          msg: 'That user does not exist',
        });
        return done(null, false, {
          message: msgJSON,
        });
      }

      const match = await bcryptjs.compare(password, user.password);
      if (!match) {
        const msgJSON = JSON.stringify({
          path: 'password',
          msg: 'The email and password do not match',
        });
        return done(null, false, {
          message: msgJSON,
        });
      }

      // If a user was found and the stored hash matches the hash of the entered password.
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  },
);

export default dbEmailStrategy;
