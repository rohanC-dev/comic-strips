var script = {};

var currentComic = Math.floor(Math.random() * 2471) + 1;

script.generateRandom = function(){
    currentComic = Math.floor(Math.random() * 2471) + 1;
    return currentComic;
}

script.prev = function(){
    currentComic--;
    return currentComic;
}

script.next = function(){
    currentComic++;
    return currentComic;
}

module.exports = script;