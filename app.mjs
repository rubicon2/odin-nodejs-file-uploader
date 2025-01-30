import express from 'express';
import session from 'express-session';
import { PrismaClient } from '@prisma/client';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import 'dotenv/config';

const app = express();
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

app.get('/', (req, res) => {
  res.send('Hello, world');
});

app.listen(process.env.PORT, () =>
  console.log('Listening on', process.env.PORT),
);
