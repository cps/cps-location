import opencage from 'opencage-api-client';
let dummyLoc = [{'id': 1, 'lat': 53.582145, 'lon': 9.985632}]

const locRepo = {
  get: function() {
    return dummyLoc[dummyLoc.length-1]
  
  },

  lastPlace: async function() {
    const lp = this.get();
    return reverseGeocode(lp.lat, lp.lon).then((results) => {
      return create_pformatted(results);
    }
    ).catch((err) => console.log(err));
    
  },

  set: function(lat, lon) {
    dummyLoc.push({'id': dummyLoc.length + 1 , 'lat': lat, 'lon': lon})
    console.log("Added " + JSON.stringify(dummyLoc[dummyLoc.length-1]));
  }

};

async function reverseGeocode(lat, lon) {
  return opencage.geocode({q: `${lat}, ${lon}`, language: 'de', no_annotations: 1})
      .then((data) => {
        if (data.results.length > 0) {
          return data.results[0];
        } else {
          console.log('status', data.status.message);
          console.log('total_results', data.total_results);
        }
      })
      .catch((error) => {
        console.log('error', error.message);
        if (error.status.code === 402) {
          console.log('hit free trial daily limit');
          console.log('become a customer: https://opencagedata.com/pricing');
        }
      });
}

function create_pformatted(result) {

  console.log('formatted: ' + result.formatted);

  // list of component pieces we want in our string
  // ordered from more precise to less
  var targets = [
    'neighbourhood',
    'suburb',       
    'city_district',
    'village',
    'town',
    'city',
    'state',
    'country'
  ];

  var privacy_formatted_pieces = [];

  // check the components list to see if the piece exists for 
  // this location
  targets.forEach(checkComponent);

  function checkComponent(item){
    if (item in result.components){
      privacy_formatted_pieces.push(result.components[item]);
    }
  }  
 
  // print the new privacy formatted string
  var pformatted = privacy_formatted_pieces.join(', ');
  console.log('privacy_formatted: ' + pformatted);

  return pformatted;
}


export default locRepo;
