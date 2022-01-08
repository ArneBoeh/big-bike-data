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
const db = dbclient.db();

function loadCSV (url, table) {
    console.log ("Downloading", url);
    fetch(url)
        .then(response => response.text())
        .then(text => csvToJson({ colParser: DATASET_COLUMN_TYPES }).fromString(text))
        .then(data => {
            console.log ("Storing", url);
            let collection = db.collection(table);
            collection.insertMany(data);
        });
}

function loadResource(url) {
    if (url.match(DATASET_TAGE_PATTERN)) {
        loadCSV(url, 'tage');
    }
    if (url.match(DATASET_15MIN_PATTERN)) {
        loadCSV(url, '15min');
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