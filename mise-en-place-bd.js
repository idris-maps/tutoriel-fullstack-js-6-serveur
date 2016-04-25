var sqlite3 = require('sqlite3')

// création de la base si elle n'existe pas
// sinon ouverture de la base
var db = new sqlite3.Database('bd.sqlite')

// la requête SQL pour créer une table avec trois champs
// * id : l'identifiant unique
// * text : le texte décrivant la chose à faire
// * fait : un booléen (vrai ou faux) 
db.run('CREATE TABLE afaire (id INTEGER PRIMARY KEY AUTOINCREMENT, text VARCHAR, fait BOOLEAN)')

// fermer la base quand la table a été créée
db.close()

// nous informer que ça a marché
console.log('la base a été créée')
