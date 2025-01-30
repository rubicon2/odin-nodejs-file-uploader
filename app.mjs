import signUpRouter from './routers/signUpRouter.mjs';

import express from 'express';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import 'dotenv/config';

const app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
const prisma = new PrismaClient();

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

app.use('/sign-up', signUpRouter);

app.get('/', (req, res) => {
  res.render('index', { title: 'Index' });
});

app.listen(process.env.PORT, () =>
  console.log('Listening on', process.env.PORT),
);
