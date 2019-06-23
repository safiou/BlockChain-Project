
const DIFFICULTY = 3;
const MINE_RATE = 3000; 
const INITIAL_BALANCE = 500;
const REWARD_MINER = 10;
const MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017/";
const dataBase_Name = "blockchain";
const baseRouteApi = '/api/users/';
module.exports = {
    DIFFICULTY,
    MINE_RATE,
    INITIAL_BALANCE,
    REWARD_MINER,
    MongoClient,
    url,
    baseRouteApi,
    dataBase_Name,
};
