
// regular setup for bodyParser, ejs, mongoose and express
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const express = require("express");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

// handling requests using B-P
app.use(bodyParser.urlencoded({extended:true}));
// to store static material
app.use(express.static("public"));

// setting up the DB: connect -> Schema -> Model
mongoose.connect("mongodb://localhost:27017/wikiDB", {useNewUrlParser: true});
const articleSchema = {
    title: String,
    content: String
};
const Article = mongoose.model("Article", articleSchema);

// refactored routing which targets ALL articles //
app.route("/articles")
    .get((req, res) => {
        Article.find((err, foundArticles)=>{
            if (err){
                res.send(err);
            } else {
                res.send(foundArticles);
            }
        })
    })
    .post((req, res) => {
        const newArticle = new Article({
            title: req.body.title, 
            content: req.body.content});
        newArticle.save(function(err){
            if (!err){
                res.send("Successfully added to the database.")
            } else {
                res.send(err);
            }
        });
    })
    .delete((req,res) => {
        Article.deleteMany((err) => {
            if (err) {
                res.send(err);
            } else {
                res.send("Successfully deleted all articles.");
            }
        });
    });

// Requests targeting specific articles //

    app.route("/articles/:customLink")
        .get((req, res) => {
            const customLink = req.params.customLink;
            Article.findOne({title: customLink}, (err, foundArticle) => {
                if (!err){
                    if (foundArticle) {
                        res.send(foundArticle);
                    } else {
                        res.send("No such article present in the database.");
                    }
                } else {
                    res.send(err)
                }
            });
        })
        .put((req, res) => {
            Article.updateOne(
                {title: req.params.customLink},
                {$set: {title: req.body.title, content: req.body.content}},
                (err) => {
                    if (!err){
                        res.send("Successfully updated the article.");
                    } else {
                        res.send(err);
                    }
                });
                //{overwrite: true},
            //     (err, res) => {
            //     if (!err) {
            //         res.send("Successfully updated the records for the article in the database.")
            //     } else {
            //         res.send(err);
            //     }
            // }
            //res.send("Successfully updated the records for the article in the database.");
        })
        // .patch((req,res) => {
        //     const customLink = req.params.customLink;
        //     Article.updateOne(
        //         {title: customLink},
        //         //{title: req.body.title, content: req.body.content},
        //         {$set: req.body},
        //         (err) => {
        //             if(!err){
        //                 res.send("Successfuly patched article.");
        //             } else {
        //                 res.send(err);
        //             }
        //         });
        // })
        .delete((req,res) => {
            const customLink = req.params.customLink;
            Article.deleteOne({title: customLink}, (err) => {
                if (!err) {
                   res.send("Article successfully delete."); 
                } else {
                    res.send("There was a problem deleting the article." + err);
                }
            });
        });

//listening port opened up
app.listen(3000, ()=>{
    console.log("The server is started at port 3000.");
})