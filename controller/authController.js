
import bcrypt from 'bcrypt';
import { getClient } from './../config/db.js';
import { setFlashMessage } from './../utils/utilityFunctions.js';

// get a MongoDB client instance
const client = getClient();

// check if the email has a valid format
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function login(req, res) {
  res.render("login", {
    error: ""
  });
};

export function logout(req, res) {
  req.session.destroy();
  res.redirect("/");
};


export async function register(req, res, next) {
  try {
    if (!isValidEmail(req.body.email)) {
      return res.render("login", {
        error: "Невірний формат електронної пошти"
      });
    }
    const users = client.db().collection('users');
    const user = await users.findOne({ email: req.body.email });

    if (user) { // check if a user with the given email already exists
      return res.render("login", {
        error: "Вказана пошта вже зареєстрована"
      });
    }
    const hash = await bcrypt.hash(req.body.password, 10);
    const data = {
      "name": req.body.name,
      "surname": req.body.surname,
      "date_bitrh": req.body.date,
      "email": req.body.email,
      "phone": req.body.phone,
      "password": hash,
      "addInfo": req.body.addInfo,
      "ShowPhone": req.body.phoneCheck,
    }; // creating a data object with user information
    await users.insertOne(data);
    setFlashMessage(req, "Успішна реєстрація!");
    res.redirect("/auth");

  } catch (error) {
    next(error);
    console.log("Register error " + error);
  }
};

export function auth(req, res, next) {
  const flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;
  req.session.returnTo = req.path || '/'; // set the returnTo property in the session
  res.render("auth", {
    flashMessage: undefined, error: ""
  });
};

export async function enter(req, res, next) {
  try {
    const params = req.body.email;
    if (!isValidEmail(req.body.email)) { // check if the email has a valid format
      return res.render("auth", {
        flashMessage: undefined,
        error: "Невірний формат електронної пошти"
      });
    }
    const users = client.db().collection('users');
    const user = await users.findOne({ email: params });

    if (!user) { // check if a user with the given email exists
      return res.render("auth", {
        flashMessage: undefined, error: "Неправильна пошта"
      });
    }

    const match = await bcrypt.compare(req.body.password, user.password); // compare the password with the hashed password in the database
    if (!match) { // check if the password is correct
      return res.render("auth", { flashMessage: undefined, error: "Неправильний пароль" });
    }

    req.session.userId = user["_id"];
    req.session.loggedIn = true;

    setFlashMessage(req, "Успішний вхід!");
    if (req.session.returnTo !== '/auth')
      res.redirect(req.session.returnTo);
    else
      res.redirect('/');
    delete req.session.returnTo;
    return;
  }
  catch (err) {
    console.error("Enter error " + err.message);
    res.render("auth", {
      flashMessage: undefined,
      error: "Неправильна пошта або пароль"
    });
    return;
  }
}
