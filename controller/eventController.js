
import calculateAge from '../src/utils/calculateAge.js';
import { setFlashMessage, renderSelectOptions, findEventById, findUserById } from './../utils/utilityFunctions.js';
import { getClient, ObjectId } from './../config/db.js';

// client for accessing the MongoDB database
const client = getClient();

// maximum number of events to display per page
const LIMIT = 9;

export async function showEvents(req, res, next) {
  try {
    const selectLevel = await renderSelectOptions('sportLevel');
    const selectType = await renderSelectOptions('sportType');

    // get a list of available events from the database
    const freeEvents = await client.db().collection('events')
      .find({
        $expr: { $lt: [{ $size: "$participants" }, { $toInt: "$maxParticipants" }] }
      })
      .limit(LIMIT)
      .toArray();

    // initial filter values for the events
    const filters = {
      type: '',
      date: '',
      level: '',
      city: ''
    };

    res.render("events", {
      selectType, selectLevel, eventsList: freeEvents, filters
    });

  } catch (error) {
    next(error);
    console.log("Events error " + error);
  }
};

export async function filterEvents(req, res, next) {
  try {
    const selectLevel = await renderSelectOptions('sportLevel');
    const selectType = await renderSelectOptions('sportType');

    // create a filter condition object
    let condition = {};

    const filters = {
      type: req.body.type || '',
      date: req.body.date || '',
      level: req.body.level || '',
      city: req.body.city || ''
    };

    // add the fields from the request body to the condition object, if they exist
    if (filters.type) condition["type"] = filters.type;
    if (filters.date) condition["date"] = filters.date;
    if (filters.level) condition["level"] = filters.level;
    if (filters.city) condition["city"] = filters.city;

    condition["$expr"] = {
      $lt: [{ $size: "$participants" }, { $toInt: "$maxParticipants" }]
    };

    // find events in the database that match the condition
    const events = await client.db().collection('events')
      .find(condition)
      .toArray();

    res.render("events", {
      selectType, selectLevel, eventsList: events, filters
    });
  } catch (error) {
    next(error);
    console.log("Filter error " + error);
  }
};

export async function loadMoreFilteredEvents(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * LIMIT;

    let condition = {};

    // Add fields to condition if they exists and aren't empty
    if (req.query.type && req.query.type !== '') {
      condition["type"] = req.query.type;
    }
    if (req.query.date && req.query.date !== '') {
      condition["date"] = req.query.date;
    }
    if (req.query.level && req.query.level !== '') {
      condition["level"] = req.query.level;
    }
    if (req.query.city && req.query.city !== '') {
      condition["city"] = req.query.city;
    }

    condition["$expr"] = {
      $lt: [{ $size: "$participants" }, { $toInt: "$maxParticipants" }]
    };

    const events = await client.db().collection('events').find(condition).skip(skip).limit(LIMIT).toArray();

    res.json({ eventsList: events });
  } catch (error) {
    next(error);
    console.log("Load more filtered error " + error);
  }
};

export async function eventCard(req, res, next) {
  try {
    const flashMessage = req.session.flashMessage;
    delete req.session.flashMessage;

    let id = req.params.id;
    const levels = client.db().collection('sportLevel');
    const event = await findEventById(id);

    if (event) {
      const owner = await findUserById(event.idOwner);
      const age = calculateAge(owner["date_bitrh"]);
      const level = await levels.findOne({ id: +event.level });
      const levelSport = level ? level.text : undefined;

      res.render("event-card", {
        flashMessage, eventsList: event, ownerEv: owner, age, levelSp: levelSport
      });
    } else {
      console.log("There is no event");
      throw ErrorEvent;
    }
  } catch (error) {
    next(error);
    console.log("Card event error " + error);
  }
};

export async function createEvent(req, res, next) {
  try {
    if (!req.session.loggedIn) {
      setFlashMessage(req, "Ви не увійшли в систему!");
      res.redirect("/auth");
      return
    }
    else {
      const selectLevel = await renderSelectOptions('sportLevel');
      const selectType = await renderSelectOptions('sportType');

      res.render("create-event", { selectType, selectLevel });
    }
  } catch (error) {
    console.error(`Create event page error: ${error}`);
    next(error);
  }
};

export async function postEvent(req, res, next) {
  try {
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
        idOwner: ObjectId(req.session.userId),
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
  } catch (error) {
    console.error(`Post event page error: ${error}`);
    next(error);
  }
};

export async function joinEvent(req, res, next) {
  try {
    let id = req.params.id;
    const events = client.db().collection('events');

    if (req.session.loggedIn) {
      const event = await findEventById(id);
      const participantStrings = event.participants.map(p => p.toString());

      // check if the current user is already a participant of the event
      if (participantStrings.includes(req.session.userId)) {
        setFlashMessage(req, "Ви вже приєднані до цієї події!");
        res.redirect("back");
        return;
      }

      await events.updateOne({ _id: ObjectId(id) }, { $addToSet: { participants: ObjectId(req.session.userId) } });
      setFlashMessage(req, "Успішне приєднання!");
      res.redirect("back");

    } else {
      setFlashMessage(req, "Ви не увійшли в систему!");
      res.redirect("/auth");
    }
  } catch (error) {
    console.log("Join event error " + error)
    setFlashMessage(req, "Приєднатися не вдалося!");
    res.redirect("back");
  }
};

export async function deleteEvent(req, res, next) {

  try {
    let id = req.params.id;
    const events = client.db().collection('events');

    if (req.session.loggedIn) {
      events.deleteOne({ _id: ObjectId(id) });
      setFlashMessage(req, "Ви видалили подію!");
      res.redirect("back");

    }
    else {
      setFlashMessage(req, "Ви не увійшли в систему!");
      res.redirect("/auth");
    }
  } catch (error) {
    console.error(`Delete event page error: ${error}`);
    next(error);
  }
};