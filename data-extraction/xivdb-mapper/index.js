const csv = require('csv-parser');
const fs = require('fs');

const nodes = {};

fs.createReadStream('nodes.csv')
    .pipe(csv())
    .on('data', function (row) {
        const position = JSON.parse(row.position);
        nodes[row.id] = {zoneid: +row.placename, x: position.ingame.x, y: position.ingame.y};
    })
    .on('end', function () {
        const res = JSON.stringify(nodes);
        fs.writeFileSync('output/nodes-position.json', res);
        console.log("nodes CSV parse success");
    });

const aetherytes = [];

fs.createReadStream('aetherytes.csv')
    .pipe(csv())
    .on('data', function (row) {
        const position = JSON.parse(row.position);
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
        const res = JSON.stringify(aetherytes);
        fs.writeFileSync('output/aetherytes.json', res);
        console.log("aetherytes CSV parse success");
    });

const monsters = {};

fs.createReadStream('monsters.csv')
    .pipe(csv())
    .on('data', function (row) {
        const position = JSON.parse(row.position);
        monsters[row.id] = {
            zoneid: +row.placename,
            x: position.ingame.x,
            y: position.ingame.y,
            level: JSON.parse(row.data).level
        };
    })
    .on('end', function () {
        const res = JSON.stringify(monsters);
        fs.writeFileSync('output/monsters.json', res);
        console.log("monsters CSV parse success");
    });
