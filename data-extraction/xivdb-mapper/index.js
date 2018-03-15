var csv = require('csv-parser');
var fs = require('fs');

var nodes = {};

fs.createReadStream('nodes.csv')
    .pipe(csv())
    .on('data', function (row) {
        var position = JSON.parse(row.position);
        nodes[row.id] = {zoneid: +row.map, x: position.ingame.x, y: position.ingame.y};
    })
    .on('end', function () {
        var res = JSON.stringify(nodes);
        fs.writeFileSync('output/nodes-position.json', res);
        console.log("nodes CSV parse success");
    });

var aetherytes = [];

fs.createReadStream('aetherytes.csv')
    .pipe(csv())
    .on('data', function (row) {
        var position = JSON.parse(row.position);
        // Type 0 is for big aetherytes, 1 is for little ones.
        aetherytes.push({
            id: row.id === "2147483647" ? 12 : +row.id,
            zoneid: +row.map,
            placenameid: +position.map.placename,
            x: position.ingame.x,
            y: position.ingame.y,
            type: row.name.indexOf('Shard') > -1 ? 1 : 0
        });
    })
    .on('end', function () {
        var res = JSON.stringify(aetherytes);
        fs.writeFileSync('output/aetherytes.json', res);
        console.log("aetherytes CSV parse success");
    });