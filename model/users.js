"use strict";
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');
const { parse, serialize } = require("../utils/json");
const { use } = require("../routes/auths");
//var escape = require("escape-html");
const jwtSecret = "ilovemysnake!";
const LIFETIME_JWT = 24 * 60 * 60 * 1000; // in ms : 24 * 60 * 60 * 1000 = 24h

const jsonDbPath = __dirname + "/../data/users.json";

const saltRounds = 10;

// Default data
const defaultItems = [

];


class Users {
  constructor(dbPath = jsonDbPath, items = defaultItems) {
    this.jsonDbPath = dbPath;
    this.defaultItems = items;
  }

  getNextId() {
    const items = parse(this.jsonDbPath, this.defaultItems);
    let nextId;
    if (items.length === 0) nextId = 1;
    else nextId = items[items.length - 1].id + 1;

    return nextId;
  }

  /**
   * Returns all items
   * @returns {Array} Array of items
   */
  getAll() {
    const items = parse(this.jsonDbPath, this.defaultItems);
    return items;
  }

  /**
   * Returns the item identified by id
   * @param {number} id - id of the item to find
   * @returns {object} the item found or undefined if the id does not lead to a item
   */
  getOne(id) {
    const items = parse(this.jsonDbPath, this.defaultItems);
    const foundIndex = items.findIndex((item) => item.id == id);
    if (foundIndex < 0) return;

    return items[foundIndex];
  }

  /**
   * Returns the item identified by username
   * @param {string} username - username of the item to find
   * @returns {object} the item found or undefined if the username does not lead to a item
   */
  async getOneByUsername(username) {
    const items = parse(this.jsonDbPath, this.defaultItems);
    const foundIndex = await items.findIndex((item) => item.username == username);
    console.log(foundIndex);
    if (foundIndex < 0) return;
    console.log(items[foundIndex]);
    return items[foundIndex];
  }

  /**
   * Add a item in the DB and returns - as Promise - the added item (containing a new id)
   * @param {object} body - it contains all required data to create a item
   * @returns {Promise} Promise reprensents the item that was created (with id)
   */

  async addOne(body) {
    const items = parse(this.jsonDbPath, this.defaultItems);
    // hash the password (async call)
    const hashedPassword = await bcrypt.hash(body.password, saltRounds);
    // add new item to the menu
    const userId = this.getNextId();
    const newitem = {
      id: userId,
      username: body.username,
      password: hashedPassword,
      bestScoreSingle: 0,
      bestScoreCoop: 0, 
      keyUp1: "Z",
      keyRight1: "D",
      keyDown1: "S",
      keyLeft1: "Q",
      keyUp2: "O",
      keyRight2: "M",
      keyDown2: "L",
      keyLeft2: "K",

    };
    items.push(newitem);
    serialize(this.jsonDbPath, items);
    return newitem;
  }

  /**
   * Delete a item in the DB and return the deleted item
   * @param {number} id - id of the item to be deleted
   * @returns {object} the item that was deleted or undefined if the delete operation failed
   */
  deleteOne(id) {
    const items = parse(this.jsonDbPath, this.defaultItems);
    const foundIndex = items.findIndex((item) => item.id == id);
    if (foundIndex < 0) return;
    const itemRemoved = items.splice(foundIndex, 1);
    serialize(this.jsonDbPath, items);

    return itemRemoved[0];
  }

  /**
   * Update a item in the DB and return the updated item
   * @param {number} id - id of the item to be updated
   * @param {object} body - it contains all the data to be updated
   * @returns {object} the updated item or undefined if the update operation failed
   */
  updateOne(id, body) {
    const items = parse(this.jsonDbPath, this.defaultItems);
    const foundIndex = items.findIndex((item) => item.id == id);
    if (foundIndex < 0) return;
    // create a new object based on the existing item - prior to modification -
    // and the properties requested to be updated (those in the body of the request)
    // use of the spread operator to create a shallow copy and repl
    const updateditem = { ...items[foundIndex], ...body };
    // replace the item found at index : (or use splice)
    items[foundIndex] = updateditem;

    serialize(this.jsonDbPath, items);
    return updateditem;
  }
  

  /**
   * Authenticate a user and generate a token if the user credentials are OK
   * @param {*} username
   * @param {*} password
   * @returns {Promise} Promise reprensents the authenticatedUser ({username:..., token:....}) or undefined if the user could not
   * be authenticated
   */

  async login(username, password) {
    console.log("login");
    const userFound = await this.getOneByUsername(username);
    console.log(userFound);
    if (!userFound){
      return;
    } 
    // checked hash of passwords
    const match = await bcrypt.compare(password, userFound.password);
    if (!match){
      return;
    } 

    const authenticatedUser = {
      id: userFound.id,
      username: userFound.username,
      bestScoreSingle: userFound.bestScoreSingle,
      bestScoreCoop: userFound.bestScoreCoop, 
      keyUp1: userFound.keyUp1,
      keyRight1: userFound.keyRight1,
      keyDown1: userFound.keyDown1,
      keyLeft1: userFound.keyLeft1,
      keyUp2: userFound.keyUp2,
      keyRight2: userFound.keyRight2,
      keyDown2: userFound.keyDown2,
      keyLeft2: userFound.keyLeft2,
      token: "Future signed token",
    };

    // replace expected token with JWT : create a JWT
    const token = jwt.sign(
      { username: authenticatedUser.username }, // session data in the payload
      jwtSecret, // secret used for the signature
      { expiresIn: LIFETIME_JWT } // lifetime of the JWT
    );

    authenticatedUser.token = token;
    return authenticatedUser;
  }

  /**
   * Create a new user in DB and generate a token
   * @param {*} username
   * @param {*} password
   * @returns the new authenticated user ({username:..., token:....}) or undefined if the user could not
   * be created (if username already in use)
   */

  async register(username, password) {
    const userFound = await this.getOneByUsername(username);
    console.log("user",userFound);
    if (userFound) return;
    console.log("user",userFound);
    const newUser = await this.addOne({ username: username, password: password});
    const authenticatedUser = {
      id: newUser.id,
      username: newUser.username,
      bestScoreSingle: 0,
      bestScoreCoop: 0, 
      keyUp1: newUser.keyUp1,
      keyRight1: newUser.keyRight1,
      keyDown1: newUser.keyDown1,
      keyLeft1: newUser.keyLeft1,
      keyUp2: newUser.keyUp2,
      keyRight2: newUser.keyRight2,
      keyDown2: newUser.keyDown2,
      keyLeft2: newUser.keyLeft2,
      token: "Future signed token",
    };

    // replace expected token with JWT : create a JWT
    const token = jwt.sign(
      { username: authenticatedUser.username }, // session data in the payload
      jwtSecret, // secret used for the signature
      { expiresIn: LIFETIME_JWT } // lifetime of the JWT
    );

    authenticatedUser.token = token;
    return authenticatedUser;
  }
}

module.exports = { Users };
