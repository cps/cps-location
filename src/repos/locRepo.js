import opencage from 'opencage-api-client';
import sqlite3 from 'sqlite3';

let db = new sqlite3.Database('./db/loc.db', (err) => {
  if (err) {
    console.error(err.message);
  }
  console.log('Connected to the database.');
})

const locRepo = {
  get: async function() {
    const sql = `SELECT *
    FROM locs
    ORDER BY id DESC
    LIMIT 1`;

    return new Promise((resolve, reject) => {
      db.get(sql, (err, row) =>{
        if(err) reject(err);
        resolve(row);
      })
    });
    
  },

  lastPlace: async function() {
    const lp = await this.get();
    return reverseGeocode(lp.lat, lp.long).then((results) => {
      return create_pformatted(results);
    }
    ).catch((err) => console.log(err));
    
  },

  set: function(lat, lon) {
    const stmt = db.prepare("INSERT INTO locs (lat, long) VALUES (?, ?)");
    stmt.run(lat, lon);
    stmt.finalize((err) => {
      if (err) console.log('DB Fehler:' + err);
      console.log("Added new location to DB");
    })
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
