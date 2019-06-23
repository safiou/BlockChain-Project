const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors')

const apiRouter = require('./apiRouter').router;
const baseRouteApi = require('../config').baseRouteApi;


const HTTP_Port = process.env.HTTP_PORT || 2500;

const app = express();



app.use(bodyParser.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cors());

app.use(baseRouteApi,apiRouter);
app.get('/test/',(req,res) => {
    
    res.send(req.query.id);
})


app.listen(HTTP_Port , () =>{
    console.log(`Listening on Port ${HTTP_Port}`);
});
