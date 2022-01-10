import { Character } from '@xivapi/nodestone';

const { parentPort, workerData } = require('worker_threads');


const characterParser = new Character();

characterParser.parse({ params: { characterId: workerData } } as any).then(char => {
  parentPort.postMessage(char);
});
