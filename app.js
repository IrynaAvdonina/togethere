
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

const app = express();

const port = process.env.PORT || 3000;
const client = new MongoClient('mongodb+srv://irina:s4y6T8me69qePX.@together.xb0v3pl.mongodb.net/togethere?retryWrites=true&w=majority',
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

app.get("/", setCurrentUser(client), async function (request, response) {
  try {
    const events = client.db().collection('events');

    events.find({}).limit(4).toArray().then(function (massEvent) {
      response.render("index", {
        massEvent
      });
    });
  } catch (error) {
    console.log("main page error" + error);
  }
});

app.get("/events", setCurrentUser(client), async function (request, response) {
  try {
    const events = client.db().collection('events');

    const levels = await client.db().collection('sportLevel').find({}).toArray();
    const sportTypes = await client.db().collection('sportType').find({}).toArray();

    const selectLevel = ejs.render(showOptions(levels));
    const selectType = ejs.render(showOptions(sportTypes));

    events.find({}).toArray().then(function (massEvent) {
      response.render("events", {
        selectType, selectLevel, massEvent,
      });
    });
  } catch (error) {
    console.log("events " + error);
  }
});

app.post("/filter", setCurrentUser(client), async function (request, response) {
  try {

    const events = client.db().collection('events');
    const levels = await client.db().collection('sportLevel').find({}).toArray();
    const sportTypes = await client.db().collection('sportType').find({}).toArray();

    const selectType = ejs.render(showOptions(sportTypes));

    const selectLevel = ejs.render(showOptions(levels));
    let condition = {};
    if (request.body.type != undefined) {
      condition["type"] = request.body.type;
    }
    if (request.body.date != '') {
      condition["date"] = request.body.date;
    }
    if (request.body.level != undefined) {
      condition["level"] = +request.body.level;
    }
    if (request.body.city != '') {

      condition["city"] = request.body.city;
    }

    events.find(condition).toArray().then(function (massEvent) {
      response.render("events", {
        selectType, selectLevel, massEvent
      });
    });
  } catch (error) {
    console.log("filter error " + error);
  }
});

app.get("/event-card/:id", setCurrentUser(client), async function (request, response) {
  try {
    let id = request.params.id;
    const events = client.db().collection('events');
    const users = client.db().collection('users');
    const levels = client.db().collection('sportLevel');

    const massEvent = await events.findOne({ _id: mongoose.Types.ObjectId(id) });

    if (massEvent) {
      const ownerEv = await users.findOne({ "_id": mongoose.Types.ObjectId(massEvent.idOwner) });
      const age = calculateAge(ownerEv["date_bitrh"]);

      const level = await levels.findOne({ id: +massEvent.level });
      let levelSp;
      console.log(massEvent.level);
      if (level) {
        levelSp = level.text;
      }

      response.render("event-card", {
        massEvent, ownerEv, age, levelSp
      });
    } else {
      console.log("Подія не знайдена");
    }
  } catch (error) {
    console.log("card event error " + error);
  }
});


app.get("/createEvent", setCurrentUser(client), async function (request, response) {
  const levels = await client.db().collection('sportLevel').find({}).toArray();
  const sportTypes = await client.db().collection('sportType').find({}).toArray();

  const selectType = ejs.render(showOptions(sportTypes));
  const selectLevel = ejs.render(showOptions(levels));

  response.render("createEvent", { selectType, selectLevel });
});

app.post("/post-event", setCurrentUser(client), async function (request, response) {
  console.log(request.body.type);
  const events = client.db().collection('events');
  if (request.session.loggedIn) {
    events.insertOne({
      name: request.body.name,
      type: request.body.type,
      maxParticipants: request.body.maxPart,
      city: request.body.city.toUpperCase(),
      place: request.body.place,
      date: request.body.date,
      time: request.body.time,
      level: request.body.level,
      addInfo: request.body.addInfo,
      idOwner: mongoose.Types.ObjectId(request.session.userId),
      participants: [],
      latLng: request.body.map.split(',')
    });
    response.redirect("/createEvent");
  }
  else {
    response.redirect("/auth");
  }
});

app.post("/join-event/:id", setCurrentUser(client), async function (req, res) {
  let id = req.params.id;
  const events = client.db().collection('events');

  if (req.session.loggedIn) {
    console.log("join to event")
    events.updateOne({ _id: mongoose.Types.ObjectId(id) },
      { $addToSet: { participants: mongoose.Types.ObjectId(req.session.userId) } })
    res.redirect("/event-card/" + id);
  }
  else {
    res.redirect("/auth");
  }
})
app.post("/delete-event/:id", setCurrentUser(client), async function (req, res) {

  let id = req.params.id;
  const events = client.db().collection('events');

  if (req.session.loggedIn) {
    console.log("deleting event");
    events.deleteOne({ _id: mongoose.Types.ObjectId(id) });
    res.redirect("/events");
  }
  else {
    res.redirect("/auth");
  }
})

app.get("/personalAccount/:id", setCurrentUser(client), async function (req, response) {
  let id = req.params.id;
  const users = client.db().collection('users');
  const events = client.db().collection('events');
  const sportLevels = client.db().collection('sportLevel');

  if (req.session.loggedIn && id == req.session.userId) {

    var params = req.session.userId;

    users.findOne({ _id: mongoose.Types.ObjectId(params) }).then(function (user) {
      if (user != undefined) {
        events.find({ idOwner: mongoose.Types.ObjectId(params) }).toArray().then(function (ownEvent) {
          console.log("свої івенти " + ownEvent);
          if (ownEvent != undefined) {
            response.render("personalAccount",
              {
                user, persEvent: ownEvent
              });
          }
          else {
            response.render("personalAccount",
              {
                user
              });
          }
        })
      }
      else
        response.redirect('/auth');
    })
  }
  else {
    response.redirect('/auth');
  }
});

app.post('/edit-profile', setCurrentUser(client), async function (req, res) {
  try {
    const users = client.db().collection('users');
    if (req.session.loggedIn) {
      if (req.body.password != "") {
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
            res.redirect("/personalAccount/" + req.session.userId)
          })

        });
      } else {
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
          res.redirect("/personalAccount/" + req.session.userId)
        })
      }
    }
  } catch (error) {
    console.log("Edit profile error" + error)


  }
})

app.get("/login", setCurrentUser(client), async function (request, response) {

  response.render("login", {
    error: ""
  });
});

app.get("/logout", setCurrentUser(client), async function (req, res) {
  req.session.userId = null;
  req.session.loggedIn = false;
  res.redirect("/auth");
});

app.post("/register", setCurrentUser(client), async function (req, response) {
  try {
    const users = client.db().collection('users');
    users.findOne({ email: req.body.email }).then(function (user) {

      if (user) {
        response.render("login", {
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
          response.redirect("/auth");
        })
      }
    })

  } catch (error) {
    console.log("Register error" + error);
  }
});

app.get("/auth", setCurrentUser(client), async function (request, response) {
  response.render("auth", {
    error: ""
  });
});

app.post("/enter", setCurrentUser(client), async function (req, response) {

  const users = client.db().collection('users');

  var params = req.body.email;
  var error = "";
  users.findOne({ email: params })
    .then(function (result) {

      if (result == undefined) {
        //console.log('Неправильна пошта або пароль');//?? чому однакові помилки
        response.render("auth", {
          error: "Неправильна пошта або пароль"
        });
        return;
      }

      bcrypt.compare(req.body.password, result["password"], function (err, hash) {
        if (hash === false) {
          //console.log('Неправильна пошта або пароль');
          response.render("auth", {
            error: "Неправильна пошта або пароль"
          });
          return;
        }
        //console.log('Успішний вхід');
        req.session.userId = result["_id"];
        //console.log(req.session.userId);
        req.session.loggedIn = true;

        /* response.render("auth", {
          error: "Успішний вхід"
        }); */

        response.redirect("/");
        return;
      })

    })
    .catch(err => {
      console.log('Неправильна пошта або пароль'); // уточнити помилку
      console.error(err.message);
      response.render("auth", {
        error: "Неправильна пошта або пароль"
      });
      return;
    });

});

app.listen(port);
