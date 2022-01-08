import fetch from 'node-fetch';
import csvToJson from 'csvtojson';

const BIKE_DATA_QUERY = 'https://www.opengov-muenchen.de/api/3/action/package_search?q=raddauerzaehlstellen&rows=1000';

const DATASET_TAGE_PATTERN  = /rad[0-9]{6}tage.*\.csv/;
const DATASET_15MIN_PATTERN = /rad[0-9]{6}15min.*\.csv/;

function loadCSV (url, table) {
    console.log ("Downloading", url);
    fetch(url)
        .then(response => response.text())
        .then(text => csvToJson().fromString(text))
        .then(json => console.log(json));
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