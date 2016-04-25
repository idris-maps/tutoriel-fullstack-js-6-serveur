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

app.use('/riot', express.static(__dirname + '/public/riot'))
app.use('/angular', express.static(__dirname + '/public/angular'))

var port = 3000
app.listen(port, function() { console.log('le serveur écoute sur le port ' + port) })
