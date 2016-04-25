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
