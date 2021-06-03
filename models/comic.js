var mongoose = require("mongoose");

var comicSchema = new mongoose.Schema({
    id: Number,
    views: {type:Number,default:0}
});

var Comic = mongoose.model("Comic", comicSchema);

module.exports = Comic;