import fetch from 'node-fetch';

const BIKE_DATA_QUERY = 'https://www.opengov-muenchen.de/api/3/action/package_search?q=raddauerzaehlstellen&rows=1000';

fetch (BIKE_DATA_QUERY)
    .then(response => response.json())
    .then(json => {
        console.log(json)}
    );