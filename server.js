require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Mongoose = require("mongoose");
const bodyParser = require("body-parser");
const validUrl = require('valid-url');
const app = express();

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use('/public', express.static(`${process.cwd()}/public`));

Mongoose.connect("mongodb://localhost:27017/urlDB", {useNewUrlParser: true, useUnifiedTopology: true});

const urlSchema = new Mongoose.Schema({
  originalUrl: String,
  shortUrl: Number
})

const Url = Mongoose.model("Url", urlSchema);



app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.post("/api/shorturl", (req, res) => {
  
  const theUrl = req.body.url;

  if(!validUrl.isHttpsUri(theUrl) && !validUrl.isHttpUri(theUrl)){
    res.json({
      error: 'invalid url'
    });
    return;
  }

  Url.findOne({originalUrl: theUrl}, (err, found) => {
      if(err){
        console.log(err);
        return;
      }  
      if(found){
        res.json({
          original_url: found.originalUrl,
          short_url: found.shortUrl
        });
      }else{
        Url.countDocuments({}, (error, count) => {
          const url = new Url({
            originalUrl: theUrl,
            shortUrl: count
          });
          url.save();
          res.json({
            original_url: url.originalUrl,
            short_url: url.shortUrl
          });
        })
      }
    });
  
});

app.get("/api/shorturl/:short_url", (req, res) => {
  Url.findOne({shortUrl: req.params.short_url}, (err, result) => {
    if(!err){
      res.redirect(result.originalUrl);
    }
  });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
