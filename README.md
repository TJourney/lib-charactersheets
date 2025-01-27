# Dyslexic Character Sheets

A library to generate character sheets for Pathfinder 2nd Edition and other games.

See the website: https://www.dyslexic-charactersheets.com/.

This project is a Node.js module: https://npmjs.com/package/dyslexic-charactersheets

You can follow progress on [the project's Patreon page](https://www.patreon.com/dyslexic_charactersheets).

# Install

To install this library in another project:
```sh
$ npm install dyslexic-charactersheets
```

To clone this library for development:
```sh
$ git clone https://github.com/dyslexic-charactersheets/lib-charactersheets.git
$ cd lib-charactersheets
$ npm install  # install dependencies
```

You can make changes, then import your version of this module into another project with:

```sh
$ npm test  # compile and run the code
$ sudo npm link -g  # export this library folder
$ cd ../your-project
$ npm link dyslexic-charactersheets  # import the library into your project
```


# Use

The library expects to be given a character's details in the form of a plain JavaScript object (details in the documentation)

```javascript
let request = {
  data: {
    type: 'character',
    id: '76af3e1',
    attributes: {
      game: 'pathfinder2',
      name: 'Valeros',
      class: 'druid',
      ...a lot more details...
    }
  }
};

const CharacterSheets = require('dyslexic-charactersheets');
CharacterSheets.create(request).then(characterSheet => {
  fs.writeFile(characterSheet.filename, characterSheet.data, (err) => {});
});
```

# Documentation

Full documentation can be found here:

- [API documentation](https://www.dyslexic-charactersheets.com/docs/jsdoc), for those using the library from outside
- [Contributors documentation](https://www.dyslexic-charactersheets.com/docs/contrib), for those looking to add to the library

# API

## Character objects

### create(...)

Creates a character sheet.

This function returns a Promise representing the data. The result is either an array of objects or a single object, each containing:

- `data` - the result, generally as HTML
- `filename` - the preferred name of the file
- `mimeType` - the MIME type of the result, typically `text/html`

```javascript
const CharacterSheets = require('dyslexic-charactersheets');
CharacterSheets.create(request).then(function (characterSheet) {
  ...
});
```

* `create()`
   * `request` \<Object\> - The request object (see below).
   * returns \<Promise\>, a promise representing the rendered character sheet.

## Global functions

### addAssetsDir(...)

Register a directory with asset files. Do this before calling `create`, and it will refer to this directory when looking for portraits, logos and background images.

```javascript
CharacterSheets.addAssetsDir('./assets');
```

* `addAssetsDir()`
  * `dir` \<String\> - A directory

### addTranslator(...)

Add a callback that supplies translations. The callback accepts a `message`, a `language` and an object with metadata; it returns either a translation, or `null`.

```javascript
CharacterSheets.addTranslator(function (message, language, meta) {
  // ...
});
```

* `addTranslator(callback)`
  * `callback` \<Function\> - A callback
    * `message` \<String\> - A string to translate
    * `language` \<String\> - A locale code, `en` or `en-GB`
    * `context` \<Object\> - Metadata for that message

### getFormData(...)

Load the data needed to render a selection form with all the options. Takes a callback that will process the data.

```javascript
CharacterSheets.getFormData(system).then(function (data) {
  // ...
});
```

* `getFormData(system, callback)`
  * `system` \<String\> - for example, `pathfinder2`
  * returns \<Promise\>
    * `data` \<Object\> - The form data

The form data is in the format:

```javascript
{
  selects: [
    {
      select: "class",
      name: "Class",
      max: 1,
      base: true,
      units: {
        "class/alchemist": {
          id: "class/alchemist",
          name: "Alchemist"
        },
        "class/fighter": {
          id: "class/fighter",
          name: "Fighter"
        },
        ...
      },
      groups: [
        {
          group: "crb",
          name: "Core Rulebook",
          units: [
            "class/alchemist",
            "class/fighter",
            ...
          ]
        },
        ...
      ]
    },
    ...
  ],
  options: [
    {
      option: "permission",
      name: "Permission to Print",
      unit: "option/permission",
      base: true
    },
    ...
  ]
}
```

## Events

### on('request')

An event emitted when a character is created, before any other actions.

```javascript
CharacterSheets.on('request', (request => {
  // ...
});
```

* `on`
  * `'request'`
  * `callback` \<Function\>
    * `request` \<Object\> - The requested character.

Note that you may not modify the request during the callback.

### on('createElementTree')

An event emitted after the element tree has been processed, but before it's rendered into HTML. Used for debugging the resulting element tree.

```javascript
CharacterSheets.on('createElementTree', ({elementTree, title, request}) => {
  // ...
});
```

* `on`
  * `'createElementTree'`
  * `callback` \<Function\>
    * `params` \<Object\>
      * `elementTree` \<Object\> - The element tree
      * `title` \<String\> - The character or party's name
      * `request` \<Object\> - The requested character

Note that you may not modify the element tree during the callback.

### on('render')

An event emitted after a character sheet has been rendered into HTML.

```javascript
CharacterSheets.on('render', ({data, title, mimeType, request}) => {
  // ...
});
```

* `on`
  * `'render'`
  * `callback` \<Function\>
    * `params` \<Object\>
      * `data` \<String\> - The rendered output
      * `title` \<String\> - The character or party's name
      * `mimeType` \<String\> - The MIME type of the result
      * `request` \<Object\> - The requested character

### on('error')

A hook that is called when an error occurs.

```javascript
CharacterSheets.on('error', (err, request) => {
  // ...
});
```

* `on`
  * `'error'`
  * `callback` \<Function\>
    * `err` \<Error\> - Error object
    * `request` \<Object\> - The requested character

# Request format

The request object describes a character, a party, or various other things you may want the library to produce.

For a detailed description of the format, see [the character sheets schema repo](https://github.com/dyslexic-charactersheets/charactersheets-schema).

## Example character

```json
{
  "version": 0,
  "data": {
    "type": "character",
    "id": "76af3e1",
    "attributes": {
      "game": "pathfinder2",
      "name": "Bob the Destroyer",
      "ancestry": "half-orc",
      "background": "hunter",
      "class": "barbarian",
      "printColor": "#f04312"
    }
  }
}
```

## Example party

```json
{
  "version": 0,
  "data": {
    "type": "party",
    "game": "pathfinder2",
    "attributes": {
      "name": "The Gravy Bunch"
    },
    "relationships": {
      "members": {
        "data": [
          { "type": "character", "id": "76af3e1" },
        ]
      }
    }
  },
  "included": [
    {
      "type": "character",
      "id": "76af3e1",
      "game": "pathfinder2",
      "name": "Bob the Destroyer",
      "ancestry": "half-orc",
      "background": "hunter",
      "class": "barbarian",
      "printColor": "#f04312"
    }
  ]
}
```


# Testing

To test this package, clone the package from [source](https://github.com/dyslexic-charactersheets/lib-charactersheets), then run:

```bash
$ cd lib-charactersheets
$ npm install
$ npm test
```

This will:
 - Compile the sources in `src` to create the files in `lib`
 - Build character sheets from the JSON files in `test/in`
 - Save them into `test/out`

## Translation testing

To properly test translations, enough character sheets need to be created to expose every single unit.

```bash
$ npm run test:i18n
```

The files will be placed in `test/out/i18n`.


# Bugs

Please raise issues or pull requests on this project.

# License

Artistic License 2.0 © Marcus Downing
