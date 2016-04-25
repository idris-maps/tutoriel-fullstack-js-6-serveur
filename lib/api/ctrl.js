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
