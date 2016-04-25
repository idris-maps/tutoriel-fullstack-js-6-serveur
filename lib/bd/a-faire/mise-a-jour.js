var sqlite3 = require('sqlite3')

module.exports = function(d, callback) {

// objet à modifier
 var obj = {
  $id: d.id,
  $text: d.text,
  $fait: d.fait
 }

// ouverture de la base
 var db = new sqlite3.Database('bd.sqlite')

 db.serialize(function() {

// mise à jour
  db.run('UPDATE afaire SET text=$text, fait=$fait WHERE id=$id', obj)

// requête de toutes les lignes
  db.all('SELECT * FROM afaire', function(err, result) {

// rappel 
   callback(err, result)
  })
 })

// fermeture
 db.close()
}
