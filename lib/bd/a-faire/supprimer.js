var sqlite3 = require('sqlite3')

module.exports = function(ids, callback) {
// ouverture
 var db = new sqlite3.Database('bd.sqlite')

 db.serialize(function() {

// suppression 
// ici "ids" représente un dictionnaire d'"id" à supprimer
  ids.forEach(function(id) {
   db.run('DELETE FROM afaire WHERE id=$id', {$id: id})
  })

// requête de toutes les lignes
  db.all('SELECT * FROM afaire', function(err, result) {

// rappel
   callback(err, result)
  })
 })

// fermeture
 db.close()
}
