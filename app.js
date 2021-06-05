var express = require("express"),
        app = express(),
  mongoose  = require("mongoose"),
    request = require("request"),
 bodyParser = require("body-parser"),
  mongoose  = require("mongoose"),

      Comic = require("./models/comic");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));


// mongoose.connect("mongodb://localhost:27017/comic", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://comic_strip1:7fgsA@aGd9Y8-eK@cluster0.bebi9.mongodb.net/Cluster0?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });


var currentComic = Math.floor(Math.random() * 2471) + 1;

app.get("/", function(req, res){
    res.redirect("/comic/" + currentComic)
});

app.post("/prev", function(req, res){
    currentComic--;
    res.redirect("/comic/" + currentComic);
});

app.post("/next", function(req, res){
    currentComic++;
    res.redirect("/comic/" + currentComic);
});

app.post("/random", function(req, res){
    console.log("random: " + currentComic);
    currentComic = Math.floor(Math.random() * 2471) + 1;
    res.redirect("/comic/" + currentComic);
});

app.get("/comic/:num", function(req, res){
    currentComic = Number(req.params.num);
    if(currentComic > 2471){
        res.render("not-found.ejs");
    }
    console.log(currentComic);
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
                                    res.render("home.ejs", {data: JSON.parse(body), views: updatedComic.views});   
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



app.listen(process.env.PORT || 3000, process.env.IP, function () {
    console.log("server started");
});

