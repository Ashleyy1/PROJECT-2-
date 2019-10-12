/*<-Heatmap Settings->*/
mapboxgl.accessToken = "pk.eyJ1IjoiYXNobGV5eXkxMDAxIiwiYSI6ImNrMHRyNG9xYTA5bHQzbm8wa2V5OHZjbXoifQ.rdGps25x_n3IsVCLPbwalg";
var map = new mapboxgl.Map({
  container: 'map', // container id
  style: 'mapbox://styles/mapbox/streets-v11',//style for geojson data
  center: [-73.95, 40.7],
  zoom: 11

});

d3.csv('/static/data/listings.csv')
  .then(listings_data => {

    //Circles on map 
    // map.on('load', function () {


    map.addLayer({
      'id': 'Click to Toggle Houses', //['latitude', 'longitude'],
      'type': 'circle',

      "source": {
        "type": "geojson",
        "data": {
          "type": "FeatureCollection",
          "features": listings_data.map(listing => {
            if (listing.price > 100 && listing.price < 150) {
              listing.color = '#3288bd';
            }
            else if (listing.price > 100 && listing.price < 150) {
              listing.color = '#99d594';
            }
            else if (listing.price >= 150 && listing.price < 200) {
              listing.color = '#e6f598';
            }
            else if (listing.price > 200 && listing.price < 250) {
              listing.color = '#ffffbf';
            }
            else if (listing.price > 300 && listing.price < 400) {
              listing.color = '#fee08b';
            }
            else if (listing.price > 400 && listing.price < 500) {
              listing.color = '#fc8d59';
            }
            else {
              listing.color = '#d53e4f';
            }
            // ['$100-150', '$150-200', '$200-250', '$250-300', '$300-400', '$400-500', '$500+'

            return {
              type: 'Feature',
              geometry: {
                type: 'Point',
                coordinates: [+listing.longitude, +listing.latitude]
              },
              properties: {
                ...listing,

              }
            }
          })
        }
      },
      // 'source-layer': 'sf2010',
      'paint': {

        // make circles larger as the user zooms from z12 to z22
        'circle-radius': {
          'base': 1.75,
          'stops': [[12, 2], [22, 180]]
        },
        // color circles by ethnicity, using a match expression
        // https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-match
        'circle-color': ['get', 'color'],
      },

      // "layout": {
      //   // "icon-image": "{icon}-15",
      //   "text-field": "{price}",
      //   "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
      //   "text-offset": [0, 0.6],
      //   "text-anchor": "top"
      // }
    });

    map.on('load', function () { //Colors and scale for the legend-keys
      var layers = ['$100-150', '$150-200', '$200-250', '$250-300', '$300-400', '$400-500', '$500+'];
      var colors = ['#3288bd', '#99d594', '#e6f598', '#ffffbf', '#fee08b', '#fc8d59', '#d53e4f'];
      
      //   //Set legend key
      for (i = 0; i < layers.length; i++) {
        var layer = layers[i];
        var color = colors[i];
        var item = document.createElement('div');
        var key = document.createElement('span');
        key.className = 'legend-key';
        key.style.backgroundColor = color;

        var value = document.createElement('span');
        value.innerHTML = layer;
        item.appendChild(key);
        item.appendChild(value);
        legend.appendChild(item);
      }
    });

    //Get prices from the map as user hovers over neighborhood
    map.on('mousemove', function (e) {
      return;
      var neighborhood = map.queryRenderedFeatures(e.point, {
        layers: ['Click to Toggle Prices']
      });

      //If mouse hovering on neighborhood, present data in top legend, else revert to original text
      if (neighborhood.length > 0) {
        document.getElementById('pd').innerHTML = '<h3><strong>' + neighborhood[0].properties.name + '</strong></h3><p><strong><em>$' + parseInt(neighborhood[0].properties.price) + '</strong> per night.</em></p>';
      } else {
        document.getElementById('pd').innerHTML = '<p>Hover for info</p>';
      }

    });

    //Allow for different layers to be toggled
    var toggleableLayerIds = ['Click to Toggle Popularity', 'Click to Toggle Houses'];
    for (var i = 0; i < toggleableLayerIds.length; i++) {
      var id = toggleableLayerIds[i];

      var link = document.createElement('a');
      link.href = '#';
      link.className = 'active';
      link.textContent = id;

      link.onclick = function (e) {
        var clickedLayer = this.textContent;
        e.preventDefault();
        e.stopPropagation();

        var visibility = map.getLayoutProperty(clickedLayer, 'visibility');

        if (visibility === 'visible') {
          map.setLayoutProperty(clickedLayer, 'visibility', 'none');
          this.className = '';
        } else {
          this.className = 'active';
          map.setLayoutProperty(clickedLayer, 'visibility', 'visible');
        }
      };

      var layers = document.getElementById('menu');
      layers.appendChild(link);
    }

    //   Click to toggle houses button
    map.on('click', 'Click to Toggle Houses', function (e) {
      var house = map.queryRenderedFeatures(e.point, {
        layers: ['Click to Toggle Houses']
      });
      var coordinates = [house[0].properties.longitude, house[0].properties.latitude]
      var reviewScore = house[0].properties.review_scores_value
      if (reviewScore == null) {
        reviewScore = 'N/a'
      }

      var htmlString = "<h3><a href ='" + house[0].properties.listing_url + "' target='_blank'>" + house[0].properties.name + "</a></h3><p><strong>Price: </strong>" + house[0].properties.price + "<strong>\nNumber of Beds: </strong>" + house[0].properties.bedrooms + "<strong>\nNumber of Bathrooms: </strong>" + house[0].properties.bathrooms + "<strong>\nRating: </strong>" + reviewScore + "/10" + "<strong>\nNumber of Reviews: </strong>" + house[0].properties.number_of_reviews + "</p>"
      new mapboxgl.Popup()
        .setLngLat(coordinates)
        .setHTML(htmlString)
        .addTo(map);
    });

    // Change the cursor to a pointer when the mouse is over the places layer.
    map.on('mouseenter', 'Click to Toggle Houses', function () {
      map.getCanvas().style.cursor = 'pointer';
    });

    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'Click to Toggle Houses', function () {
      map.getCanvas().style.cursor = '';
    });

    //set cursor in default position
    map.getCanvas().style.cursor = 'default';

    map.addControl(new mapboxgl.FullscreenControl());
    var nav = new mapboxgl.NavigationControl();
    map.addControl(nav, 'bottom-left');

    // map.scrollZoom.disable();


    //
  });