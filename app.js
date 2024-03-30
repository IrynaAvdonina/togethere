import express from 'express';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import session from 'express-session';
import bodyParser from 'body-parser';
import ejs from 'ejs';

import calculateAge from './src/js/utils/calculateAge.js';
import setCurrentUser from './src/js/utils/setCurrentUser.js';
import showOptions from './src/js/api/showOptions.js';
import dotenv from 'dotenv';

function setFlashMessage(req, message) {
  req.session.flashMessage = message;
}

dotenv.config();

const mongodbUri = process.env.MONGODB_URI;
const app = express();
const port = process.env.PORT || 3000;
const client = new MongoClient(mongodbUri,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });


try {
  client.connect();
  console.log("Connection OK");
} catch (error) {
  console.log("Connection Error " + error);
};
try {
  app.use(session({
    secret: "bober-kurwa",
    resave: true,
    saveUninitialized: true
  }))
} catch (error) {
  console.log("Connection session Error " + error);
}

app.use(express.json())

app.use(express.urlencoded({ extended: true }))
app.use(bodyParser.urlencoded({
  extended: true
}));

app.use('/public', express.static('public'));
app.use('/src', express.static('src'));
app.use('/database', express.static('database'));
app.use(setCurrentUser(client));

app.set("view engine", "ejs");
app.set("views", "./views");


app.get("/", setCurrentUser(client), async function (req, res) {
  try {
    const events = client.db().collection('events');
    const flashMessage = req.session.flashMessage;
    delete req.session.flashMessage;

    events.find({}).limit(4).toArray().then(function (massEvent) {
      res.render("index", {
        flashMessage,
        massEvent
      });
    });
  } catch (error) {
    console.log("main page error" + error);
  }
});

app.get("/events", setCurrentUser(client), async function (req, res) {
  try {
    const events = client.db().collection('events');

    const levels = await client.db().collection('sportLevel').find({}).toArray();
    const sportTypes = await client.db().collection('sportType').find({}).toArray();

    const selectLevel = ejs.render(showOptions(levels));
    const selectType = ejs.render(showOptions(sportTypes));

    events.find({}).toArray().then(function (massEvent) {
      res.render("events", {
        selectType, selectLevel, massEvent,
      });
    });
  } catch (error) {
    console.log("events " + error);
  }
});

app.post("/filter", setCurrentUser(client), async function (req, res) {
  try {

    const events = client.db().collection('events');
    const levels = await client.db().collection('sportLevel').find({}).toArray();
    const sportTypes = await client.db().collection('sportType').find({}).toArray();

    const selectType = ejs.render(showOptions(sportTypes));

    const selectLevel = ejs.render(showOptions(levels));
    let condition = {};
    if (req.body.type != undefined) {
      condition["type"] = req.body.type;
    }
    if (req.body.date != '') {
      condition["date"] = req.body.date;
    }
    if (req.body.level != undefined) {
      condition["level"] = +req.body.level;
    }
    if (req.body.city != '') {

      condition["city"] = req.body.city;
    }

    events.find(condition).toArray().then(function (massEvent) {
      res.render("events", {
        selectType, selectLevel, massEvent
      });
    });
  } catch (error) {
    console.log("filter error " + error);
  }
});

app.get("/event-card/:id", setCurrentUser(client), async function (req, res) {
  try {
    const flashMessage = req.session.flashMessage;
    delete req.session.flashMessage;

    let id = req.params.id;
    const events = client.db().collection('events');
    const users = client.db().collection('users');
    const levels = client.db().collection('sportLevel');

    const massEvent = await events.findOne({ _id: mongoose.Types.ObjectId(id) });

    if (massEvent) {
      const ownerEv = await users.findOne({ "_id": mongoose.Types.ObjectId(massEvent.idOwner) });
      const age = calculateAge(ownerEv["date_bitrh"]);

      const level = await levels.findOne({ id: +massEvent.level });
      let levelSp;
      //console.log(massEvent.level);
      if (level) {
        levelSp = level.text;
      }

      res.render("event-card", {
        flashMessage, massEvent, ownerEv, age, levelSp
      });
    } else {
      console.log("Подія не знайдена");
    }
  } catch (error) {
    console.log("card event error " + error);
  }
});


app.get("/createEvent", setCurrentUser(client), async function (req, res) {
  if (!req.session.loggedIn) {

    setFlashMessage(req, "Ви не увійшли в систему!");
    res.redirect("/auth");
    return
  }
  else {
    const levels = await client.db().collection('sportLevel').find({}).toArray();
    const sportTypes = await client.db().collection('sportType').find({}).toArray();

    const selectType = ejs.render(showOptions(sportTypes));
    const selectLevel = ejs.render(showOptions(levels));

    res.render("createEvent", { selectType, selectLevel });
  }
});

app.post("/post-event", setCurrentUser(client), async function (req, res) {

  const events = client.db().collection('events');
  if (req.session.loggedIn) {
    const result = await events.insertOne({
      name: req.body.name,
      type: req.body.type,
      maxParticipants: req.body.maxPart,
      city: req.body.city.toUpperCase(),
      place: req.body.place,
      date: req.body.date,
      time: req.body.time,
      level: req.body.level,
      addInfo: req.body.addInfo,
      idOwner: mongoose.Types.ObjectId(req.session.userId),
      participants: [],
      latLng: req.body.map.split(',')
    });
    const eventId = result.insertedId.toString();
    setFlashMessage(req, "Ви успішно створили подію!");
    res.redirect("/event-card/" + eventId);
  }
  else {
    setFlashMessage(req, "Ви не увійшли в систему!");
    res.redirect("/auth");
  }
});

app.post("/join-event/:id", setCurrentUser(client), async function (req, res) {
  let id = req.params.id;
  const events = client.db().collection('events');

  if (req.session.loggedIn) {

    try {
      const eventId = mongoose.Types.ObjectId(id);
      const event = await events.findOne({ _id: eventId });
      const participantStrings = event.participants.map(p => p.toString());

      if (participantStrings.includes(req.session.userId)) {
        setFlashMessage(req, "Ви вже приєднані до цієї події!");
        res.redirect("back");
        return;
      }

      await events.updateOne({ _id: mongoose.Types.ObjectId(id) }, { $addToSet: { participants: mongoose.Types.ObjectId(req.session.userId) } });
      setFlashMessage(req, "Успішне приєднання!");
      res.redirect("back");

    } catch (error) {
      console.log(error)
      setFlashMessage(req, "Приєднатися не вдалося!");
      res.redirect("back");
    }
  }
  else {
    setFlashMessage(req, "Ви не увійшли в систему!");
    res.redirect("/auth");
  }
})

app.post("/delete-event/:id", setCurrentUser(client), async function (req, res) {

  let id = req.params.id;
  const events = client.db().collection('events');

  if (req.session.loggedIn) {
    //console.log("deleting event");
    events.deleteOne({ _id: mongoose.Types.ObjectId(id) });
    setFlashMessage(req, "Ви видалили подію!");
    res.redirect("back");

  }
  else {
    setFlashMessage(req, "Ви не увійшли в систему!");
    res.redirect("/auth");
  }
})

app.get("/personalAccount/:id", setCurrentUser(client), async function (req, res) {
  let id = req.params.id;
  const flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;
  const users = client.db().collection('users');
  const events = client.db().collection('events');

  // TODO: додати івенти в яких береш участь

  if (req.session.loggedIn && id == req.session.userId) {

    var params = req.session.userId;

    // TODO: перевіряти чи дійсно було оновлення

    users.findOne({ _id: mongoose.Types.ObjectId(params) }).then(function (user) {
      if (user != undefined) {
        events.find({ idOwner: mongoose.Types.ObjectId(params) }).toArray().then(function (ownEvent) {
          if (ownEvent != undefined) {
            res.render("personalAccount",
              {
                flashMessage, user, persEvent: ownEvent
              });
          }
          else {
            res.render("personalAccount",
              {
                user
              });
          }
        })
      }
      else
        res.redirect('/auth');
    })
  }
  else {
    res.redirect('/auth');
  }
});

app.post('/edit-profile', setCurrentUser(client), async function (req, res) {
  try {
    const users = client.db().collection('users');
    if (req.session.loggedIn) {
      if (req.body.password != "") { //якщо пароль не змінився
        bcrypt.hash(req.body.password, 10, function (err, hash) {

          users.findOneAndUpdate({
            _id: mongoose.Types.ObjectId(req.session.userId)
          }, {
            $set: {
              "name": req.body.name,
              "surname": req.body.surname,
              "date_bitrh": req.body.date,
              "email": req.body.email,
              "phone": req.body.phone,
              "password": hash,
              "addInfo": req.body.addInfo
            }
          }).then(function (user) {
            setFlashMessage(req, "Ви успішно оновили профіль!");
            res.redirect("back");
          })
        });
      } else { //якщо пароль змінився
        users.findOneAndUpdate({
          _id: mongoose.Types.ObjectId(req.session.userId)
        }, {
          $set: {
            "name": req.body.name,
            "surname": req.body.surname,
            "date_bitrh": req.body.date,
            "email": req.body.email,
            "phone": req.body.phone,
            "addInfo": req.body.addInfo
          }
        }).then(function (user) {
          setFlashMessage(req, "Ви успішно оновили профіль!");
          res.redirect("back");
        })
      }
    }
  } catch (error) {
    console.log("Edit profile error" + error)
  }
})

app.get("/login", setCurrentUser(client), async function (req, res) {

  res.render("login", {
    error: ""
  });
});

app.get("/logout", setCurrentUser(client), async function (req, res) {
  req.session.userId = null;
  req.session.loggedIn = false;
  res.redirect("back");
});

app.post("/register", setCurrentUser(client), async function (req, res) {
  try {
    const users = client.db().collection('users');
    users.findOne({ email: req.body.email }).then(function (user) {

      if (user) {
        res.render("login", {
          error: "Вказана пошта вже зареєстрована"
        });
        return;
      }
      else {
        bcrypt.hash(req.body.password, 10, function (err, hash) {
          // console.log(hash);
          var data = {
            "name": req.body.name,
            "surname": req.body.surname,
            "date_bitrh": req.body.date,
            "email": req.body.email,
            "phone": req.body.phone,
            "password": hash,
            "addInfo": req.body.addInfo,
            "ShowPhone": req.body.phoneCheck,
          };
          users.insertOne(data);
          setFlashMessage(req, "Успішний вхід!");
          res.redirect("/auth");
        })
      }
    })

  } catch (error) {
    console.log("Register error" + error);
  }
});

app.get("/auth", setCurrentUser(client), async function (req, res) {
  const flashMessage = req.session.flashMessage;
  delete req.session.flashMessage;
  req.session.returnTo = req.path || '/';
  res.render("auth", {
    flashMessage, error: ""
  });
});

app.post("/enter", setCurrentUser(client), async function (req, res) {

  const users = client.db().collection('users');

  var params = req.body.email;
  users.findOne({ email: params })
    .then(function (result) {

      if (result == undefined) {
        //console.log('Неправильна пошта або пароль');
        //?? чому однакові помилки
        res.render("auth", {
          error: "Неправильна пошта або пароль"
        });
        return;
      }

      bcrypt.compare(req.body.password, result["password"], function (err, hash) {
        if (hash === false) {
          //console.log('Неправильна пошта або пароль');
          res.render("auth", {
            error: "Неправильна пошта або пароль"
          });
          return;
        }
        req.session.userId = result["_id"];
        req.session.loggedIn = true;

        setFlashMessage(req, "Успішний вхід!");
        if (req.session.returnTo !== '/auth')
          res.redirect(req.session.returnTo);
        else
          res.redirect('/');
        delete req.session.returnTo;
        return;
      })

    })
    .catch(err => {
      console.log('Неправильна пошта або пароль'); // уточнити помилку
      console.error(err.message);
      res.render("auth", {
        error: "Неправильна пошта або пароль"
      });
      return;
    });

});

app.listen(port);
