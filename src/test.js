var theUrl = '/?period=hour&type=significant';
var theurl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';


const url = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/';
var theUrl = '/?period=week&type=4.5';

router.get('/proxy', async(req, res) => {
    const time = theUrl.split('=')[1].split('&')[0];
    const sig = theUrl.split('=')[2];
    var newUrl = url;
    newUrl = url.concat(sig.concat('_').concat(time).concat('.geojson'));
    const response = await fetch(newUrl);
    const text = await response.json();
    console.log(text);
    res.send(
        text
    )
  });

