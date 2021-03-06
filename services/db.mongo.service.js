'use strict';

const MongoClient = require('mongodb').MongoClient;

const DEFAULT_URL = 'mongodb://localhost:27017';
const DEFAULT_DB = 'blog';

class DBService {
  constructor(url = DEFAULT_URL, dbName = DEFAULT_DB) {
    DBService.connect(url, dbName).catch(err => { console.error(err); });
  }

  static async connect(url = DEFAULT_URL, dbName = DEFAULT_DB) {
    if (!DBService._db) {
      const client = await MongoClient.connect(url, { useNewUrlParser: true });
      DBService._db = client.db(dbName);
      console.log(`Connected successfully to database ${dbName}`);
    }
    return true;
  }

  static async createIndex(collection, ...fields) {
    const key = fields.reduce((keyObj, field) => ({ ...keyObj, [field]: 1 }), {});
    collection.createIndex(key);
  }

  static async getCollection(collectionName) {
    const collection = DBService._db.collection(collectionName);
    await collection.stats();
    return collection;
  }

  isReady() {
    return DBService._db ? true : false;
  }

  async getAll(collectionName) {
    const collection = await DBService.getCollection(collectionName);
    return collection.find({}, { projection: { _id: 0 } }).toArray();
  }

  async getById(collectionName, id) {
    const collection = await DBService.getCollection(collectionName);
    return collection.findOne({ id }, { projection: { _id: 0 } });
  }

  async getByQuery(collectionName, queryObj) {
    const collection = await DBService.getCollection(collectionName);
    return collection.find(queryObj, { projection: { _id: 0 } }).toArray();
  }

  async insert(collectionName, data) {
    const collection = await DBService.getCollection(collectionName);
    return collection.insertOne(data);
  }

  async update(collectionName, id, data) {
    const collection = await DBService.getCollection(collectionName);
    return collection.updateOne({ id }, { $set: data });
  }

  async remove(collectionName, id) {
    const collection = await DBService.getCollection(collectionName);
    return collection.deleteOne({ id });
  }

  async getMax(collectionName, fieldName) {
    const collection = await DBService.getCollection(collectionName);
    return (await collection.find().sort({ [fieldName]: -1 }).limit(1).next())[fieldName];
  }
}

module.exports = DBService;
