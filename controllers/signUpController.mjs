import prisma from '../db/prisma.mjs';
import bcryptjs from 'bcryptjs';

function getSignUp(req, res, next) {
  res.render('sign-up/sign-up', {
    title: 'Sign Up',
    formData: req.session.formData,
    errors: req.session.errors,
  });
  next();
}

function getSuccess(req, res, next) {
  res.render('sign-up/success', { title: 'Sign Up Successful' });
  next();
}

async function postSignUp(req, res, next) {
  const { email, password, confirm_password } = req.body;

  // Check user email not already used.
  const existing = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  const errors = {};
  if (existing) errors.email = 'That user already exists';
  if (password !== confirm_password)
    errors.confirm_password = 'Passwords do not match';
  req.session.errors = { ...errors };
  req.session.save(async (error) => {
    if (error) next(error);
    // Make sure all this stuff, and all redirects occur after the session has been saved.
    if (!existing && password === confirm_password) {
      const hash = await bcryptjs.hash(password, 10);
      await prisma.user.create({
        data: {
          email,
          password: hash,
        },
      });
      // If successful, redirect to success page.
      res.status(303).redirect('/sign-up/success');
    } else {
      // If failure, redirect to getSignUp route with form values and errors.
      res.status(400).redirect('/sign-up');
    }
  });
}

export { getSignUp, getSuccess, postSignUp };
