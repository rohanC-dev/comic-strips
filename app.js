const { json } = require("body-parser");
var express = require("express"),
        app = express(),
  mongoose  = require("mongoose"),
    request = require("request"),
 bodyParser = require("body-parser"),
  mongoose  = require("mongoose"),

      Comic = require("./models/comic");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));


//mongoose.connect("mongodb://localhost:27017/comic", { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect("mongodb+srv://comic_strip1:7fgsA@aGd9Y8-eK@cluster0.bebi9.mongodb.net/Cluster0?retryWrites=true&w=majority", { useNewUrlParser: true, useUnifiedTopology: true });


const axios = require("axios");
let promise = axios.get("https://xkcd.com/info.0.json").then(res => res.data)


app.get("/", function(req, res){
    promise.then(data => {
        var currentComic = Math.floor(Math.random() * Number(data.num)) + 1;
        res.redirect("/comic/" + currentComic)
    
    });
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
    promise.then(data => {
        var currentComic = Math.floor(Math.random() * Number(data.num)) + 1;
        res.redirect("/comic/" + currentComic)
    });
});

app.get("/comic/:num", function(req, res){
    currentComic = Number(req.params.num);
    promise.then(data => {
        if(currentComic > data.num || currentComic < 1){
            res.render("not-found.ejs");
        }
    });
    
    
    request("https://xkcd.com/" + currentComic + "/info.0.json", function(error, response, body){
		if(!error && response.statusCode == 200){
   
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
                                    res.render("home.ejs", {data: JSON.parse(body), views: updatedComic.views, fullTranscript: parseTranscript(body), fullTitle: getFullTitle(JSON.parse(body).transcript.split("\n"))}); 
                                });
                            }
                        });
                    }else{
                        Comic.findOneAndUpdate({id: currentComic}, {$inc : { views : 1}}, {new: true }, function(err, updatedComic){
                            if(err){
                                console.log("there was an error");
                                console.log(err); 
                            }
                            res.render("home.ejs", {data: JSON.parse(body), views: updatedComic.views, fullTranscript: parseTranscript(body), fullTitle: getFullTitle(JSON.parse(body).transcript.split("\n"))});
                        });
                    }

                }
            });
            
		}
	});
});


function getFullTitle(splitTranscriptString){

    var fullTitle;
    for(var i = splitTranscriptString.length-1; i > 0; i--){
        if(splitTranscriptString[i].charAt(0) == '{'){
            fullTitle = splitTranscriptString[i];
        }
    }

    if(fullTitle){
        
        if(fullTitle.substring(2, 7).toLowerCase() != "title"){
            return "";
        }
        return fullTitle.substring(2+12, fullTitle.length-2);
    }else{
        return "";
    }
}

function parseTranscript(body){
    var transcriptString = JSON.parse(body).transcript;
    var splitTranscriptString = transcriptString.split("\n");

    var formattedTranscript = [];

    for(var i = 0; i < splitTranscriptString.length; i++){
        if(splitTranscriptString[i].charAt(0) == '['){

            formattedTranscript.push({
                string: splitTranscriptString[i].substring(2, splitTranscriptString[i].length-2),
                type: "["
            });

        }else if(splitTranscriptString[i].charAt(0) == '<'){
            
            formattedTranscript.push({
                string: splitTranscriptString[i].substring(2, splitTranscriptString[i].length-2),
                type: "<"
            });
        }else if(splitTranscriptString[i].charAt(0) == '{'){

            formattedTranscript.push({
                string: splitTranscriptString[i].substring(2, splitTranscriptString[i].length-2),
                type: "{"
            });
            if(i < splitTranscriptString.length-1){
                var checkNext = splitTranscriptString[i+1].slice(-1);
                if(checkNext == '}'){
                formattedTranscript.push({
                    string: splitTranscriptString[i+1].substring(0, splitTranscriptString[i].length-2),
                    type: "{"
                });
                i++;
            }
            }
            
        }else if(splitTranscriptString[i].charAt(0) != '[' || splitTranscriptString[i].charAt(0) != '<'){
            
            formattedTranscript.push({
                string: splitTranscriptString[i],
                type: "dialogue"
            });
        }
    }
    return formattedTranscript;
}

app.listen(process.env.PORT || 3000, process.env.IP, function (req, res) {
    console.log("server started");
    
});

