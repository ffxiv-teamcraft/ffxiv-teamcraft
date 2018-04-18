const fs = require('fs');


/*
                WIP
 */

function cleanTranslation(translation, codeBulk, exclusions = [], parent = '') {
    let parentObject = translation;
    if (parent.length > 0) {
        const objectPath = parent.split('.');
        for (const level of objectPath) {
            parentObject = parentObject[level];
        }
    }
    for (const key of Object.keys(parentObject)) {
        const fullKey = parent.length > 0 ? parent + '.' + key : key;
        if (typeof(parentObject[key]) === 'object') {
            cleanTranslation(translation, codeBulk, exclusions, fullKey);
        } else {
            const excluded = exclusions.find(exclusion => fullKey.indexOf(exclusion) > -1) !== undefined;
            if (!excluded && codeBulk.indexOf(fullKey) === -1) {
                const propertyToDelete = fullKey.split('.').pop();
                delete parentObject[propertyToDelete];
            }
        }
    }
    return parentObject;
}

function walkSync(dir, filelist) {
    const files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function (file) {
        if (fs.statSync(dir + file).isDirectory()) {
            filelist = walkSync(dir + file + '/', filelist);
        }
        else {
            filelist.push(dir + file);
        }
    });
    return filelist;
}

const translations = fs.readdirSync('./src/assets/i18n/')
    .map(file => ({
        path: './src/assets/i18n/' + file,
        content: JSON.parse(fs.readFileSync('./src/assets/i18n/' + file, 'UTF-8'))
    }));

const sourceFiles = walkSync('./src/app/');

const reducer = (currentValue, file) => {
    return currentValue + fs.readFileSync(file, 'UTF-8');
};

const bulkSourceCode = sourceFiles.reduce(reducer, '');


translations.forEach(translation => {
    const cleaned = cleanTranslation(translation.content, bulkSourceCode, ['LIST_TAGS', 'auth/']);
    fs.writeFileSync(translation.path + '.clean.json', JSON.stringify(cleaned));
});


