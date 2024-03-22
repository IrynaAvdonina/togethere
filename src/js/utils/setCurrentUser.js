import mongoose from 'mongoose';

export default function setCurrentUser(client) {
  return function (req, res, next) {
    const users = client.db().collection('users');

    if (req.session.loggedIn) {
      var params = req.session.userId;
      users.findOne({ _id: mongoose.Types.ObjectId(params) }).then(function (user) {
        if (user != undefined) {
          res.locals.currentUser = user;
          res.locals.text = "Особистий кабінет";
        }
        return next();
      })
    }
    else {
      return next();
    }
  }
}