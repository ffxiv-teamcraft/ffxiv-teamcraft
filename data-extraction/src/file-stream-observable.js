const fs = require('fs');
const { Observable } = require('rxjs');
const csv = require('csv-parser');

const defaultOptions = {
  // number of bits to read at a time
  highWaterMark: 1,
  encoding: 'utf8'
};

module.exports = (path, options = defaultOptions) =>
  Observable.create((observer) => {
    const file$ = fs.createReadStream(path, options).pipe(csv());

    file$.on('data', (chunk) => observer.next(chunk));
    file$.on('end', () => observer.complete());
    file$.on('close', () => observer.complete());
    file$.on('error', (error) => observer.error(error));

    // there seems to be no way to actually close the stream
    return () => file$.pause();
  });
