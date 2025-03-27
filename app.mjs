import signUpRouter from './routers/signUpRouter.mjs';
import accountRouter from './routers/accountRouter.mjs';
import fileRouter from './routers/fileRouter.mjs';
import folderRouter from './routers/folderRouter.mjs';
import prisma from './db/prisma.mjs';
import passportInit from './middleware/passport.mjs';

import express from 'express';
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import 'dotenv/config';

const app = express();
app.use('/public', express.static('public'));
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
app.use('/file', fileRouter);
app.use('/folder', folderRouter);

app.get('/', async (req, res, next) => {
  try {
    let files = [];
    let folders = [];
    if (req.user) {
      const filePromise = prisma.file.findMany({
        where: {
          AND: [
            {
              ownerId: req.user.id,
            },
            {
              folderId: null,
            },
          ],
        },
        orderBy: {
          name: 'asc',
        },
      });

      const folderPromise = prisma.folder.findMany({
        where: {
          AND: [
            {
              ownerId: req.user.id,
            },
            {
              parentId: null,
            },
          ],
        },
        include: {
          children: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      files = await filePromise;
      folders = await folderPromise;
    }

    const root = {
      title: 'Root',
      parentId: null,
      children: folders,
      files,
    };

    res.render('folder/folder', {
      title: 'Root',
      user: req.user,
      folder: root,
      isRoot: true,
    });
  } catch (error) {
    next(error);
  }
});

app.use((req, res) => {
  res.render('404', { title: 'Page not found', user: req.user });
});

app.use((error, req, res, next) => {
  res.render('error', { title: 'Error', user: req.user, error });
});

app.listen(process.env.PORT, () =>
  console.log('Listening on', process.env.PORT),
);
