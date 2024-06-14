# togethere

[![repo-top-language](https://img.shields.io/github/languages/top/IrynaAvdonina/togethere?style=flat&color=0080ff)]()
[![last-commit](https://img.shields.io/github/last-commit/IrynaAvdonina/togethere?style=flat&logo=git&logoColor=white&color=0080ff)]()
[![repo-language-count](https://img.shields.io/github/languages/count/IrynaAvdonina/togethere?style=flat&color=0080ff)]()

Developed with the software and tools below.

[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E.svg?style=flat&logo=JavaScript&logoColor=black)]() 
[![Nodemon](https://img.shields.io/badge/Nodemon-76D04B.svg?style=flat&logo=Nodemon&logoColor=white)]()
[![Express](https://img.shields.io/badge/Express-000000.svg?style=flat&logo=Express&logoColor=white)]()

## 🔗 Quick Links

> - [📍 Overview](#-overview)
> - [📦 Features](#-features)
> - [📂 Repository Structure](#-repository-structure)
> - [🚀 Getting Started](#-getting-started)
>   - [⚙️ Installation](#️-installation)
>   - [🤖 Running togethere](#-running-togethere)
>   - [🧪 Tests](#-tests)

---

## 📍 Overview



                                                                 ![Logo](https://raw.githubusercontent.com/IrynaAvdonina/togethere/main/public/img/icon96.ico)

ToGetThere is created to unite people who want to spend time in sports together. It provides an opportunity not only to find like-minded individuals but also to create your own events that others can attend. This is an ideal tool for those looking to make new social connections through sports activities.

![App Screenshot](https://raw.githubusercontent.com/IrynaAvdonina/togethere/main/public/screenshots/main.jpg)

![App Screenshot](https://raw.githubusercontent.com/IrynaAvdonina/togethere/main/public/screenshots/events.jpg)


---

## 📦 Features

- Creating a new user account.
- Logging into the system for registered users.
- Creating events, specifying the type of sport, date, time, location, and a point on the map.
- Determining the user's location.
- Deleting events that are no longer relevant.
- Searching for events based on various criteria, such as type of sport, location, date, and time.
- Ability to join events created by other users.
- Ability to edit the user profile.


Built With

* Front-end: HTML(EJS), CSS, JavaScript
* Back-end: Node.js, Express.js
* Database: MongoDB
* Mapping Services: Leaflet, Mapbox


---

## 📂 Repository Structure

```sh
└── togethere/
    ├── README.md
    ├── app.js
    ├── config         #contains configuration files such as database settings, sessions, etc
    ├── controller          #contains controllers that handle routes and application logic
    ├── package-lock.json
    ├── package.json
    ├── public           #contains static resources such as CSS files and images
    │   ├── css
    │   │   ├── elements         #specific style elements
    │   └── img
    ├── src         #contains the source code of the application
    │   ├── api          #logic for working with the API
    │   └── utils           #supporting utilities and functions
    ├── utils           #additional utilities used in the project
    └── views            #view templates such as `.ejs` files
```



## 🚀 Getting Started

***Requirements***

Ensure you have the following dependencies installed on your system:

* **ejs**: `^3.1.8`
* **express**: `^4.18.1`
* **mongoose**: `^6.3.8`

### ⚙️ Installation

1. Clone the togethere repository:

```sh
git clone https://github.com/IrynaAvdonina/togethere
```

2. Change to the project directory:

```sh
cd togethere
```

3. Install the dependencies:

```sh
npm install
```

### 🤖 Running togethere

Use the following command to run togethere:

```sh
npm node app.js
```

### 🧪 Tests

To execute tests, run:

```sh
npm test
```

---
