import fetch from 'node-fetch';
import csvToJson from 'csvtojson';
import mongodb from 'mongodb';

const BIKE_DATA_QUERY = 'https://www.opengov-muenchen.de/api/3/action/package_search?q=raddauerzaehlstellen&rows=1000';

const DATASET_TAGE_PATTERN  = /rad[0-9]{6}tage.*\.csv/;
const DATASET_15MIN_PATTERN = /rad[0-9]{6}15min.*\.csv/;

const DATASET_COLUMN_TYPES = {
    'datum': 'string',
    'uhrzeit_start': 'string',
    'uhrzeit_ende': 'string',
    'zaehlstelle': 'string',
    'richtung_1': 'number',
    'richtung_2': 'number',
    'gesamt': 'number',
    'min-temp': 'number',
    'max-temp': 'number',
    'niederschlag': 'number',
    'bewoelkung': 'number',
    'sonnenstunden': 'number'
};

const dbclient = new mongodb.MongoClient(process.env.MUNICH_BIKES_DB_CONNECTION);
await dbclient.connect();
//
//Live Demo: DB Namen eingeben!
//
const db = dbclient.db();

function loadCSV (url, table) {
    console.log ("Downloading", url);
    fetch(url)
        .then(response => response.text())
        .then(text => csvToJson({ colParser: DATASET_COLUMN_TYPES }).fromString(text))
        .then(data => {
            data.forEach(row => {
                // Combine separate date/time columns:
                row.zeit = combineDateTimeStrings(row.datum, row.uhrzeit_start, url);
                delete row.datum;
                delete row.uhrzeit_start;
                delete row.uhrzeit_ende;
            });
            console.log ("Storing", url);
            let collection = db.collection(table);
            collection.insertMany(data);
        });
}

function combineDateTimeStrings(datestr, timestr, url) {
    // Some dates are in dd.mm.yyyy, some in yyyy.dd.mm
    let datefix = '';
    if (datestr.match(/^\d\d\.\d\d\.\d\d\d\d$/)) {
        datefix = datestr.substring(6, 10) + '-' + datestr.substring(3, 5) + '-' + datestr.substring(0, 2);
    } else if (datestr.match(/^\d\d\d\d\.\d\d\.\d\d$/)) {
        datefix = datestr.replaceAll('.', '-');
    } else {
        throw 'Invalid date string input ' + datestr + ' in ' + url;
    }

    // Some times are in hh:mm, some in hh:mm:ss
    let timefix = '';
    if (timestr.match(/^\d\d:\d\d$/)) {
        timefix = timestr + ':00';
    } else if (timestr.match(/^\d\d:\d\d:\d\d$/)) {
        timefix = timestr;
    } else {
        throw 'Invalid time string input ' + timestr + ' in ' + url;
    }

    let datetimestr = datefix + 'T' + timefix;
    let date = new Date(datetimestr)
    // Make sure we really created a valid date:
    if (isNaN(date.getTime())) {
        throw 'Invalid date string ' + datetimestr + ' in ' + url;
    }
    return date;
}

function loadResource(url) {
    if (url.match(DATASET_TAGE_PATTERN)) {
        loadCSV(url, 'tage');
    }
    if (url.match(DATASET_15MIN_PATTERN)) {
        loadCSV(url, 'viertelstunden');
    }
}

fetch (BIKE_DATA_QUERY)
    .then(response => response.json())
    .then(json => {
        json.result.results.forEach(result => {
            result.resources.forEach(resource => {
                loadResource(resource.url);
            });
        })
    });