import express from 'express';

import { connectDB, getClient } from './config/db.js';
import session from './config/session.js';
import { main, personalAccount, editProfile } from './controller/otherControllers.js'
import { login, logout, register, auth, enter } from './controller/authController.js'
import { showEvents, filterEvents, loadMoreFilteredEvents, eventCard, createEvent, postEvent, joinEvent, deleteEvent } from './controller/eventController.js'

import { setCurrentUser } from './utils/utilityFunctions.js';
const app = express();
const port = process.env.PORT || 3000;

connectDB();

const client = getClient();

app.use(session);
app.use(express.json())
app.use(express.urlencoded({
  extended: true
}));

app.use('/public', express.static('public'));
app.use('/src', express.static('src'));
app.use(setCurrentUser(client));

app.set("view engine", "ejs");
app.set("views", "./views");

app.get("/", main);
app.get("/personal-account/:id", personalAccount);
app.post('/edit-profile', editProfile)
app.get("/events", showEvents);
app.post("/filter", filterEvents);
app.get('/events/load-more-filtered', loadMoreFilteredEvents);
app.get("/event-card/:id", eventCard);
app.get("/create-event", createEvent);
app.post("/post-event", postEvent);
app.post("/join-event/:id", joinEvent);
app.post("/delete-event/:id", deleteEvent);
app.get("/login", login);
app.get("/logout", logout);
app.post("/register", register);
app.get("/auth", auth);
app.post("/enter", enter)

app.use((req, res) => {
  res.status(404).render('error', {
    status: 404
  });
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).render('error', {
    status: err.status || 500
  });
});

app.listen(port);
