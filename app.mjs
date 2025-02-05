import signUpRouter from './routers/signUpRouter.mjs';
import accountRouter from './routers/accountRouter.mjs';
import prisma from './db/prisma.mjs';
import passportInit from './middleware/passport.mjs';

import express from 'express';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import 'dotenv/config';

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');

app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days in millis.
    },
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 1000 * 60 * 2, // 2 minutes in millis.
      dbRecordIdIsSessionId: true,
      dbRecordIdFunction: undefined,
    }),
  }),
);

const passport = passportInit();
app.use(passport.session());

app.use('/sign-up', signUpRouter);
app.use('/account', accountRouter);

app.get('/', (req, res) => {
  res.render('index', { title: 'Index' });
});

app.listen(process.env.PORT, () =>
  console.log('Listening on', process.env.PORT),
);
