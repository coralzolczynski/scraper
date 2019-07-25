var express = require ('express');
var logger = require ('morgan');
var mongoose = require('mongoose');

var axios = require ('axios');
var cheerio = require ('cheerio');

var db = require('./models');

var PORT = 3000;

var app = express();

app.use(logger('dev'));
app.use(express.urlencoded({extended: true}));
app.use(express.json());

app.use(express.static('public'));

mongoose.connect('mongodb://localhost/unit18Popolater', { useNewUrlParser: true});

// routes

app.get("/scrape", (req, res) => {
    axios.get('http://www.echojs.com/').then(function(response) {
        var $ = cheerio.load(response.data);

        $('article h2').each(function(i, element) {
            var result = {};

            result.title = $(this)
                .children('a')
                .text();
            result.link = $(this)
                .children('a')
                .attr('href');
            
            db.Article.create(result)
                .then(function(dbArticle) {
                    console.log(dbArticle);
                })
                .catch(function(err) {
                    console.log(err);
                });
        });
        res.send('Scrape Complete');
    });
});

app.get('/articles', (req, res) => {
    db.Article.find({})
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err)
        });
});

app.get("/articles/:id", (req, res) => {
    db.Article.findOne({_id:req.params.id})
        .populate('note')
        .then(function(dbArticle) {
            res.json(dbArticle);
        })
        .catch(function(err) {
            res.json(err);
        });
});

