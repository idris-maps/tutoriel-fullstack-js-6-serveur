var sqlite3 = require('sqlite3')

module.exports = function(callback) {

// ouverture de la base
 var db = new sqlite3.Database('bd.sqlite')

// requête
 db.all('SELECT * FROM afaire', function(err, result) {

// fonction de rappel
  callback(err, result)
 })

// fermeture
 db.close()
}
