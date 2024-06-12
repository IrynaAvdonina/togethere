import bcrypt from 'bcrypt';

import { getClient, ObjectId } from '../config/db.js';
import { setFlashMessage, findUserById } from '../utils/utilityFunctions.js';

const client = getClient();

export async function main(req, res, next) {
  try {
    const popularEvents = await client.db().collection('events').find({}).limit(4).toArray();
    const flashMessage = req.session.flashMessage;
    delete req.session.flashMessage;

    res.render("index", {
      flashMessage,
      eventsList: popularEvents
    });
  } catch (error) {
    next(error);
    console.log("Main page error " + error);
  }
};

export async function personalAccount(req, res, next) {
  try {
    let id = req.params.id;
    const flashMessage = req.session.flashMessage;
    delete req.session.flashMessage;

    const events = client.db().collection('events');

    // TODO: add events where you are participating

    if (req.session.loggedIn && id == req.session.userId) {

      const params = req.session.userId;
      const user = await findUserById(params);
      if (user) {
        const ownEvent = await events.find({ idOwner: ObjectId(params) }).toArray();
        if (ownEvent != undefined) {
          res.render("personal-account",
            {
              flashMessage, user, persEvent: ownEvent
            });
        }
        else {
          res.render("personal-account", { user });
        }
      }
      else
        res.redirect('/auth');
    }
    else {
      res.redirect('/auth');
    }
  } catch (error) {
    next(error);

  }
};

export async function editProfile(req, res, next) {
  if (!req.session.loggedIn) {
    return res.redirect('/auth');
  }
  try {
    const users = client.db().collection('users');
    const updateFields = {
      name: req.body.name,
      surname: req.body.surname,
      date_bitrh: req.body.date,
      phone: req.body.phone,
      addInfo: req.body.addInfo
    };

    if (req.body.password) {
      updateFields.password = await bcrypt.hash(req.body.password, 10);
    }

    await users.findOneAndUpdate({ _id: ObjectId(req.session.userId) }, { $set: updateFields });
    setFlashMessage(req, "Ви успішно оновили профіль!");
    res.redirect("back");
  }
  catch (error) {
    next(error);
    setFlashMessage(req, "Сталася помилка при оновленні профілю. Спробуйте ще раз.");
    console.log("Edit profile error " + error)
  }
};


