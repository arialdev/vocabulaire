# Vocabulaire

[![Ionic GitHub CI](https://github.com/arialdev/vocabulaire/actions/workflows/pipeline.yml/badge.svg?branch=main)](https://github.com/arialdev/vocabulaire/actions/workflows/pipeline.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=arialdev_vocabulaire&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=arialdev_vocabulaire)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=arialdev_vocabulaire&metric=coverage)](https://sonarcloud.io/summary/new_code?id=arialdev_vocabulaire)

Vocabulaire is the best mobile app for learning new vocabulary!

![Vocabulaire logo](/resources/readme/logo.png "Vocabulaire logo")

## Authors

Hi! My name is Álvaro Rivas, *arialdev* on social media. You can find more about me
on [my personal GitHub page](https://github.com/arialdev/arialdev).

## Idea

Its idea was born one day when my French teacher told us that the next day there would be an exam: we had to study the
verbs ended with -ir.
I was confident because I always wrote down every new word that I heard, so I just had to have a look to my notebook.
My surprise was when I took it and I saw hundreds of word written: verbs, nouns, expressions, adjectives, etc. That
afternoon I lost a lot of studying time because I also had to search verbs among all those words. I promised to myself:
I have to deal with this for the next time.

## Technologies

Vocabulaire is a mobile app written with Ionic + Angular. It is tested using Karma + Jasmine and Cypress.
I also converted it in one of thesis, so I put a lot of love in this project.

As Vocabulaire is Open Source, other developers could get an example of a mobile app built with those technologies.
It could also be useful to see how some Cordova and Capacitor plugins are used:

- [@ionic/storage](https://github.com/ionic-team/ionic-storage). Store data in user storage.
- [cordova-sqlite-storage](https://github.com/ionic-team/ionic-storage#sqlite-installation). Make storage more robust.
- [@capacitor/filesystem](https://capacitorjs.com/docs/apis/filesystem). Store files in user storage.
- [@awesome-cordova-plugins/pdf-generator](https://ionicframework.com/docs/native/pdf-generator). Generate pdf files
  from html files.
- [@awesome-cordova-plugins/screen-orientation](https://ionicframework.com/docs/native/screen-orientation). Change or
  locks user device's screen orientation.

There are also used other interesting modules such as:

- [@ngx-translate](https://github.com/ngx-translate/core). i18n library recommended by Ionic when using Angular.
- [Swiper](https://swiperjs.com). Create swiping slides.

## Set the project up

### 1. Install Node
This project is currently working on versions equal to or greater than version 16. Functioning cannot be assured on lower versions.
For installing Node you can follow the official instructions [here](https://nodejs.org/en/download/).

*Note: you may have to restart your computer.*

### 2. Install Angular Cli
You can find more information on [its oficial website](https://angular.io/cli).
```shell
npm install -g @angular/cli
```

### 3. Install Ionic Cli
You can find more information on [its oficial website](https://ionicframework.com/docs/cli).
```shell
npm install -g @ionic/cli
```

### 4. Install dependencies
Run the following command inside the project directory.
```shell
npm i
```

## How to use

### Run

```shell
npm start
```

### Build

```shell
npm build
```

### Build apk

As the built platforms are set to be skipped from pushing to the remote repository, you'll need to build them by
yourself.

```shell
npm run build:android
```

This command will build your project for android platform and will open your Android Studio IDE.
There, you can generate an apk by clicking on Build > Build Bundle(s) / APK(s) > Build APK(s)

![Generate APK](/resources/readme/build%20apk.png "How to build APK")

The app that you'll generate will not have the appropriate assets for the app icon and splashscreen.
You can find them on *<root of the project>/resources/android-applied*.
You shall copy all those files and paste them on *<root of the project>/android/app/src/main/res*.

![How to paste assets for Android Platform](/resources/readme/android-assets.png "How to paste assets for Android Platform")

At this moment this app is not ready to be deployed on iOS yet. Why? Because Vocabulaire is a free app with no
profitable
mechanisms, so there is no incentive to pay the App Store fee. Therefore, this app has not been designed for Apple's
platforms.

### Unit testing

```shell
npm test
```

### e2e testing (Cypress)

First you need to run the server. E2E is set to listen to port 4200, so will run our project as an Angular project to
use its default port.

```shell
ng serve
```

On another shell process we'll run

```shell
npm run cypress:run
```

This command will run all the E2E tests and then the process will terminate. If you prefer to open a GUI you can run
instead:

```shell
npm run cypress:open
```

You may prefer to start a server and run all E2E tests at once, maybe for CI reasons. You can achieve that by using

```shell
npm run ci:cy-run
```

## Open Source

As this project is open source, feel free for contributing to it 😁. Just remember the rules:

- Pull Requests must always pass the CI test and Sonar validation.
- This is a free project. No advertisement will be included and the only form of funding may be via donations.
- This project is written in English, so please, communicate in English. Don't worry if English is not your first
  language, here we do not judge anybody. In fact, you might have notice several mistake on this readme 😅.
- This app should perfectly work Internet-less. No critical module should require Internet access.

## Roadmap

Here there are listed some next features. If you want to contribute to this project, you can pick any of them (check out
first if there is already someone working on that feature).

### Backend

As this is a Internet-less app, building a backend must be an optional feature.
Right now users can export and import their data by generating and recovering a .json file.
Users should have the option to back-up all their data via **cloud**.
This feature shall be implemented taking into considerations that we must only request the minimum and necessary data
from the user.

### Improve Emoji Picker.

Emoji Picker shall improve the following features:

- Implement a searchbar
- Improve the displaying performance.

You can find the scrapping tools on *<root of the project>/utils/loadEmojis.js*.

### UX Design

Current themes can be improved. I'm not a UX designer, I did my best, although I'm sure Vocabulaire can be much more
fancy. New themes are also welcome.

