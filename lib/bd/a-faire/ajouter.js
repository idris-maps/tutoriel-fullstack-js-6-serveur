var sqlite3 = require('sqlite3')

module.exports = function(d, callback) {
 var obj = {
  $text: d.text,
  $fait: d.fait
 }

// ouverture de la base
 var db = new sqlite3.Database('bd.sqlite')

// .serialize implique que les requêtes seront faites l'une après l'autre
 db.serialize(function() {

// ajout de la ligne
  db.run('INSERT INTO afaire (text, fait) VALUES ($text, $fait)', obj)

// retrait de toutes les lignes
  db.all('SELECT * FROM afaire', function(err, result) {

// fonction de rappel avec les erreurs s'il y en a et le résultat (toutes les lignes de la table)
   callback(err, result)
  })
 })

// fermeture de la base
 db.close()
}
