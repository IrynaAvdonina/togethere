import ejs from 'ejs';

import { getClient, ObjectId } from './../config/db.js';
import showOptions from '../src/utils/showOptions.js';

const client = getClient();

//Middleware function to set the current user

export function setCurrentUser(client) {
  return function (req, res, next) {
    const users = client.db().collection('users');

    if (req.session.loggedIn) {
      const params = req.session.userId;
      users.findOne({ _id: ObjectId(params) })
        .then(function (user) {
          if (user != undefined) {
            res.locals.currentUser = user;
            res.locals.text = "Особистий кабінет";
          }
          return next();
        })
        .catch(next);
    } else {
      return next();
    }
  }
}

// Sets a flash message in the session
export function setFlashMessage(req, message) {
  req.session.flashMessage = message;
  // TODO add flash type
}

// Renders the options for a select element
export const renderSelectOptions = async (collectionName) => {
  try {
    const collection = await client.db().collection(collectionName).find({}).toArray();
    return ejs.render(showOptions(collection));
  } catch (error) {
    console.error('Error rendering select options', error);
    throw error;
  }
}

// Finds an event by its ID
export const findEventById = async (id) => {
  try {
    return await client.db().collection('events').findOne({ _id: ObjectId(id) });
  } catch (error) {
    console.error('Error finding event by ID ', error);
    throw error;
  }
};

//Finds a user by their ID
export const findUserById = async (id) => {
  try {
    return await client.db().collection('users').findOne({ _id: ObjectId(id) });
  } catch (error) {
    console.error('Error finding user by ID ', error);
    throw error;
  }
};
