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
