# Le serveur

Jusqu'à maintenant nos applications de liste "à faire", se remettent à zéro chaque fois que nous rafraîchissons la page. Tout ce que nous y ajoutons ne reste en mémoire que pour la session courante. Si nous voulons revenir dessus plus tard, ou la partager avec d'autres, il nous faut garder les données sur un serveur.

Dans ce chapitre nous allons utiliser un serveur [Express](http://expressjs.com/) et une base de données [SQLite](https://www.sqlite.org/).

Express est un serveur écrit en javascript. Il existe une multitide d'architectures possibles pour les serveurs. L'intéret de l'écrire en javascript est qu'on utilise le même language côté serveur que côté client.

J'ai choisi d'utiliser SQLite pour ce tutoriel parce qu'il n'y a pas besoin de l'installer sur votre machine. Il est évidemment possible d'utiliser n'importe quelle base de données avec Express. Si vous avez déjà une base Postgres, jetez un coup d'oeil à la librairie [pg](https://www.npmjs.com/package/pg). Si vous utilisez MongoDB, il y a [mongoose](https://www.npmjs.com/package/mongoose).

## Une api REST

La communication entre les applications et la base de données se fera par le biais d'une api [REST](https://fr.wikipedia.org/wiki/Representational_State_Transfer). Pour faire court, disons que le serveur envoit les données à l'application. Quand une modification a lieu dans l'application, celle-ci l'envoit au serveur qui modifie la base de donnée et renvoit les données modifiées.

## Mise en place

Créez un nouveau dossier ```6.serveur```, initialisez NPM et téléchargez les librairies ```express``` (le serveur), ```body-parser``` (pour que le serveur puisse lire ce qui lui est envoyé) et ```sqlite3``` (qui fera la liaison avec la base de données).

```
$ npm init
$ npm install express body-parser sqlite3
```

## La base de données

### Création de la base et de la table

Pour commencer nous allons créer un fichier qui met en place la base de données avec une table ```afaire```.

Créez un fichier ```mise-en-place-bd.js```

```
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
```

Ajoutez un scripte ```init-bd``` dans ```package.json``` qui efface la base de donnée si elle existe déjà puis la crée à nouveau.

```
"init-bd": "rm bd.sqlite | node mise-en-place-bd"
```

Lancez le scripte dans le terminal:

```
$ npm run init-bd
```

Un nouveau fichier a été créé dans le dossier ```6.serveur```: ```bd.sqlite```.

### Fonctions pour accéder à la base

Créez un dossier ```lib``` et à l'intérieur de celui-ci un dossier ```bd```.

#### Requêtes

Dans ce dossier créez un fichier ```a-faire.js``` qui gérera les opérations que nous souhaitons faire sur la table ```afaire``` ainsi qu'un autre dossier ```a-faire``` ou on mettra le détail de ces opérations.

Nous avons quatre type de requêtes à créer:
* Ajouter une nouvelle ligne
* Lire toutes les lignes
* Modifier une ligne
* Supprimer des lignes

Pour chacune d'entre elles nous créons un fichier dans le dossier ```lib/bd/a-faire``` qui sera référencée dans ```lib/bd/a-faire.js```.

**ajouter.js**

```
var sqlite3 = require('sqlite3')

module.exports = function(d, callback) {

// l'argument "d" ce sont les données
// nous créons un objet avec "text" et "fait"
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
```

**lire.js**

```
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
```

**mise-a-jour.js**

```
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
```

**supprimer.js**

```
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
```

**a-faire.js**

Dans le dossier ```lib/bd```, nous allons mettre ensemble toutes ces requêtes dans ```a-faire.js```

```
var ajouter = require('./a-faire/ajouter')
var lire = require('./a-faire/lire')
var maj = require('./a-faire/mise-a-jour')
var supprimer = require('./a-faire/supprimer')

exports.ajouter = function(d, callback) {
 ajouter(d, function(err, resp) { callback(err, resp) })
}
exports.lire = function(callback) {
 lire(function(err, resp) { callback(err, resp) })
}
exports.maj = function(d, callback) {
 maj(d, function(err, resp) { callback(err, resp) })
}
exports.supprimer = function(ids, callback) {
 supprimer(ids, function(err, resp) { callback(err, resp) })
}
```

#### Vérifions que la base fonctionne

À la racine du projet, créez un fichier ```verif-bd.js```

```
var bd = require('./lib/bd/a-faire')
 
// une variable pour garder l'objet ajouté
var obj

// ajouter un objet

bd.ajouter({text: 'Manger', fait: true}, function(err, rep) {

// notifier s'il y a une erreur
 if(err) { console.log(err) }

// sinon
 else {

// la réponse
  console.log('ajouter', rep)

// garder le premier objet
  obj = rep[0]
 }
})

// une seconde plus tard
setTimeout(function() {

// lire
 bd.lire(function(err, rep) {
  if(err) { console.log(err) }
  else { console.log('lire', rep) }
 })

},1000)

// deux secondes plus tard
setTimeout(function() {

// modifier "obj"
 obj.text = 'Dormir'

// mettre à jour
 bd.maj(obj, function(err, rep) {
  if(err) { console.log(err) }
  else { console.log('mise à jour', rep) }
 })
},2000)

// trois secondes plus tard
setTimeout(function() {

// un dictionnaire avec l'id de "obj"
 var aSupprimer = [obj.id]

// supprimer
 bd.supprimer(aSupprimer, function(err, rep) {
  if(err) { console.log(err) }
  else { console.log('supprimer', rep) }
 }) 
},3000)
```

Lancez le scripte:

```
$ node verif-bd
```


Si vous obtenez:

```
ajouter [ { id: 1, text: 'Manger', fait: 1 } ]
lire [ { id: 1, text: 'Manger', fait: 1 } ]
mise à jour [ { id: 1, text: 'Dormir', fait: 1 } ]
supprimer []
```

Les requêtes à la base de données fonctionnent.

Vous noterez que le booléen ```fait``` est ```1``` à la place de ```true``` et ```0``` à la place de ```false```. Généralement ça ne pose pas de problème du côté client. Mais j'ai remarqué que Angular, l'interprétait comme un chiffre. Pour être certains que ça marche partout, ajoutons une fonction ```arrangerBool()``` à ```lib/bd/a-faire.js```.

```
var ajouter = require('./a-faire/ajouter')
var lire = require('./a-faire/lire')
var maj = require('./a-faire/mise-a-jour')
var supprimer = require('./a-faire/supprimer')

exports.ajouter = function(d, callback) {
 ajouter(d, function(err, resp) { callback(err, arrangerBool(resp)) })
}
exports.lire = function(callback) {
 lire(function(err, resp) { callback(err, arrangerBool(resp)) })
}
exports.maj = function(d, callback) {
 maj(d, function(err, resp) { callback(err, arrangerBool(resp)) })
}
exports.supprimer = function(ids, callback) {
 supprimer(ids, function(err, resp) { callback(err, arrangerBool(resp)) })
}

function arrangerBool(dic) {
 dic.forEach(function(obj) {
  if(obj.fait === 0) { obj.fait = false }
  else { obj.fait = true }
 })
 return dic
}
```

## Le serveur

Nous allons maintenant écrire le serveur qui fera le lien entre la base et les clients. À la racine du projet, créez un fichier ```serveur.js```

```
// Express
var express = require('express')
var app = express()

// body-parser
var bodyParser = require('body-parser')
app.use(bodyParser.json()) // pour lire les JSON envoyés par les clients
app.use(bodyParser.urlencoded({ extended: true }));

// l'accès à la base de données
var bd = require('./lib/bd/a-faire')

// quand un client POST une nouvelle entrée
app.post('/api/a-faire', function(req, res) {

// "req" = requête du client
// "res" = réponse du serveur

// "req.body" = données reçues
 var d = req.body

// "bd.ajouter()"
 bd.ajouter(d, function(err, rep) {

// si erreur retourner le statut 500 et l'erreur
  if(err) { res.status(500).send(err) }

// sinon retourner la réponse de la base "rep" avec un statut 200
  else { res.status(200).send(rep) }
 })
})

// quand un client GET toutes les entrées
app.get('/api/a-faire', function(req,res) {
 bd.lire(function(err,rep) {
  if(err) { res.status(500).send(err) }
  else { res.status(200).send(rep) }
 })
})

// quand un client POST une mise à jour
app.post('/api/a-faire/maj', function(req,res) {
 var d = req.body
 bd.maj(d, function(err,rep) {
  if(err) { res.status(500).send(err) }
  else { res.status(200).send(rep) }  
 })
})

// quand un client POST des ID à supprimer
app.post('/api/a-faire/supprimer', function(req,res) {
 var d = req.body
 bd.supprimer(d, function(err,rep) {
  if(err) { res.status(500).send(err) }
  else { res.status(200).send(rep) }  
 })
})

// écouter
var port = 3000
app.listen(port, function() { console.log('le serveur écoute sur le port ' + port) })
```

Il est déjà difficile d'avoir une bonne vue d'ensemble de ce fichier. Nous allons bouger les logiques de l'API dans un autre fichier. Dans ```lib```, créez un dossier ```api``` et à l'intérieur de celui-ci un fichier ```ctrl.js```.

**lib/api/ctrl.js**

```
var bd = require('../bd/a-faire')

exports.ajouter = function(req, res) {
 var d = req.body
 bd.ajouter(d, function(err, rep) {
  if(err) { res.status(500).send(err) }
  else { res.status(200).send(rep) }
 })
}

exports.lire = function(req,res) {
 bd.lire(function(err,rep) {
  if(err) { res.status(500).send(err) }
  else { res.status(200).send(rep) }
 })
}

exports.maj = function(req,res) {
 var d = req.body
 bd.maj(d, function(err,rep) {
  if(err) { res.status(500).send(err) }
  else { res.status(200).send(rep) }  
 })
}

exports.supprimer = function(req,res) {
 var d = req.body
 bd.supprimer(d, function(err,rep) {
  if(err) { res.status(500).send(err) }
  else { res.status(200).send(rep) }  
 })
}
```

**serveur.js**

```
var express = require('express')
var app = express()

var bodyParser = require('body-parser')
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

var apiCtrl = require('./lib/api/ctrl')
app.post('/api/a-faire', apiCtrl.ajouter)
app.get('/api/a-faire', apiCtrl.lire)
app.post('/api/a-faire/maj', apiCtrl.maj)
app.post('/api/a-faire/supprimer', apiCtrl.supprimer)

var port = 3000
app.listen(port, function() { console.log('le serveur écoute sur le port ' + port) })
```

Nous avons maintenant un serveur REST. Dans le prochain chapitre nous allons servir les clients et les adapter pour communiquer avec le serveur. Nous pouvons déja créer les URL d'accès aux clients que nous mettrons dans un dossier ```public```.

Il y aura deux clients:

* riot (chapitre 2)
* angular (chapitre 5)

L'accès au serveur se fait par le modèle, ce n'est pas la peine d'avoir les variantes "vanilla" et "handlebars" puisque c'est le même modèle qu'avec "riot".

Créez le dossier ```public``` à la racine du projet et à l'intérieur de celui-ci un dossier par client.

```
public
  angular
  riot
```

Dans ```serveur.js```, ajoutez les lignes suivantes avant ```app.listen()```

```
app.use('/riot', express.static(__dirname + '/public/riot'))
app.use('/angular', express.static(__dirname + '/public/angular'))
```

Pour toutes les URL commençant par "/client/riot", express servira les fichiers du dossier ```public/riot```. Par exemple ```/client/riot/script.js``` renvoit le fichier ```/public/riot/script.js``` s'il existe.

Dans le prochain chapitre nous connecterons nos clients à l'API.




