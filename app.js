var express = require("express");
var app = express();

var mongoose  = require("mongoose");

var request =  require("request");

var bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));


app.use(express.static(__dirname + "/public"));

var Comic = require("./models/comic");

// mongoose.connect("mongodb://localhost:27017/comic", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://comic_strip1:7fgsA@aGd9Y8-eK@cluster0.bebi9.mongodb.net/Cluster0?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });


var currentComic;
generateRandom();

app.get("/", function(req, res){
    console.log(currentComic);
    request("https://xkcd.com/" + currentComic + "/info.0.json", function(error, response, body){
		if(!error && response.statusCode == 200){

            Comic.find({id: Number(currentComic)}, function(err, retrievedComic){
                if(err){
                    console.log("there was an error finding comic");
                    console.log(err);
                }else{

                    if(Object.keys(retrievedComic).length === 0){
                        Comic.create({id: currentComic, views: 0}, function(err, createdComic){
                            if(err){
                                console.log("there was an error");
                                console.log(err);
                            }else{
                                Comic.findOneAndUpdate({id: currentComic}, {$inc : { views : 1}}, {new: true }, function(err, updatedComic){
                                    if(err){
                                        console.log("there was an error");
                                        console.log(err); 
                                    }
                                    res.render("home.ejs", {data: JSON.parse(body), views: updatedComic.views                   });   
                                });
                            }
                        });
                    }else{
                        Comic.findOneAndUpdate({id: currentComic}, {$inc : { views : 1}}, {new: true }, function(err, updatedComic){
                            if(err){
                                console.log("there was an error");
                                console.log(err); 
                            }
                            res.render("home.ejs", {data: JSON.parse(body), views: updatedComic.views});   
                        });
                    }

                }
            });
		}
	});
});

app.post("/prev", function(req, res){
    currentComic--;
    res.redirect("/");
    
});

app.post("/next", function(req, res){
    currentComic++;
    res.redirect("/");
    
});

app.get("/:num", function(req, res){
    currentComic = Number(req.params.num);
    
    request("https://xkcd.com/" + currentComic + "/info.0.json", function(error, response, body){
		if(!error && response.statusCode == 200){
            //res.render("home.ejs", {data: JSON.parse(body)}); 
            
            Comic.find({id: currentComic}, function(err, retrievedComic){
                if(err){
                    console.log("there was an error");
                    console.log(err);
                }else{

                    if(Object.keys(retrievedComic).length === 0){
                        Comic.create({id: currentComic, views: 0}, function(err, createdComic){
                            if(err){
                                console.log("there was an error");
                                console.log(err);
                            }else{
                                Comic.findOneAndUpdate({id: currentComic}, {$inc : { views : 1}}, {new: true }, function(err, updatedComic){
                                    if(err){
                                        console.log("there was an error");
                                        console.log(err); 
                                    }
                                    res.render("home.ejs", {data: JSON.parse(body), views: updatedComic.views                   });   
                                });
                            }
                        });
                    }else{
                        Comic.findOneAndUpdate({id: currentComic}, {$inc : { views : 1}}, {new: true }, function(err, updatedComic){
                            if(err){
                                console.log("there was an error");
                                console.log(err); 
                            }
                            res.render("home.ejs", {data: JSON.parse(body), views: updatedComic.views});   
                        });
                    }

                }
            });
		}
	});
});

app.post("/random", function(req, res){
    generateRandom();
    res.redirect("/");
});


function generateRandom(){
    currentComic = Math.floor(Math.random() * 2471) + 1;
}




app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("server started");
});
