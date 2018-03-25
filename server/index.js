'use strict'

var express = require('express')
var db = require('../db')
var helpers = require('./helpers')
var bodyParser = require('body-parser')

module.exports = express()
  .set('view engine', 'ejs')
  .set('views', 'view')
  .use(express.static('static'))
  .use('/image', express.static('./db/image'))
  .use(bodyParser.urlencoded({ extended: false })) //application/x-www-form-urlencoded parser
  .use(bodyParser.json())
  // TODO: Serve the images in `db/image` on `/image`.
  .get('/', all)
  .get('/:id', getAnimal)
  .get('/form', form)
  /* TODO: Other HTTP methods. */
  // .post('/', add) //aanmaken
  // .get('/:id', get)
  // .put('/:id', set)
  // .patch('/:id', change) //gedeelte aanpassen
  // .delete('/:id', remove) //verwijderen
  .post('/', addAnimal)
  .delete('/:id', removeAnimal)
  .listen(1902) //listen to port 1902

function all(req, res) {
  var result = {errors: [], data: db.all()}

  /* Use the following to support just HTML:  */
  res.render('list.ejs', Object.assign({}, result, helpers))

  /* Support both a request for JSON and a request for HTML  */
  res.format({
    json: () => res.json(result),
    html: () => res.render('list.ejs', Object.assign({}, result, helpers))
  })

}
//get Animal middleware
function getAnimal(req, res){
//Create result object
  var result ={
    errors:[], //Array of errors
    data:[] //Array of data
};
//Create shorthand variable for req.params.id
var id = req.params.id;

//400 page
try {
  //for an existing id = true
  db.has(id)
} catch (err) {
  //if id is invalid (for example '-')
  if (err.code === db.ERR_INVALID_ID) {
  //throw errror 400 bad request.
    result.errors.push({
      id: 400,
      data: "400 - bad request"});

    res
    .status(400)
    .render('error.ejs', Object.assign({}, result , helpers))
    return
  }
}

// 404 PAGE NOT FOUND
// Check if the database contains an animal with the given ID
if(!db.has(id)){
  //Database does not contain an animal with this ID, Create
  result.errors.push({
    id: 404,
    data: "404 - not found"});

//Set the response status to 404 and render the error page
res
  .status(404)
  .render('error.ejs', Object.assign({}, result, helpers))
  return;
}

// //410 PAGE GONE
// if(!db.has(id)){
//   if (db.removed(id)){  //Check if an animal is removed.
//   //Database does not contain an animal with this ID, Create
//   result.errors.push({
//     id: 410,
//     data: "410 - gone"});
//
//  //Set the response status to 404 and render the error page
//     res
//       .status(410)
//       .render('error.ejs', Object.assign({}, result, helpers))
//       return;
//       }
// }

//DETAIL pagina show.
else {
  result = {
          errors: [], //Array of errors
          data: db.get(id) //Array of data
      };
  res
  .render('detail.ejs', Object.assign({}, result, helpers))
  }
}


// curl --verbose --request DELETE localhost:1902/something
// curl --verbose --request DELETE localhost:1902/88623

function removeAnimal(req, res){
  var result ={
    errors:[], //Array of errors
    data:[] //Array of data
};
  //Create shorthand variable for req.params.id
  var id = req.params.id

  if(db.get(id)){  //if identifier of animal
    db.remove(id)  // then Remove identifier of animal
    res
    .status(204)
    .json(db.get(id)) // will set the HTTP status code to 204 and works in express 4
  }

//410 PAGE
  // if(!db.get(id)){
  //   if (db.removed(id)){ //Check if an animal is removed.
  //   //Database does not contain an animal with this ID, Create
  //   result.errors.push({
  //     id: 410,
  //     data: "410 - gone"});
  //
  //  //Set the response status to 404 and render the error page
  //     res
  //       .status(410)
  //       .render('error.ejs', Object.assign({}, result, helpers))
  //       return;
  //       }
  // }

  //if it is not working give a 404 page + error message
  else {
    res
      .status(404)
      .render('error.ejs', Object.assign({}, result, helpers))
      return;
  }
}

//Show form by localhost:1902/form
function form(req, res) {

  var result ={
    errors:[], //Array of errors
    data:[] //Array of data
};
if (req.url === "/form.html")

    res.render('form.ejs', Object.assign({}, result, helpers))
}

//Add new animal into database
//For the .post form u need to create a form (U can find this form in ./view/form.js)
function addAnimal(req,res) {
  var result ={
    errors:[], //Array of errors
    data:[] //Array of data
};

  var animal =
  { id: '18646',
   name: req.body.name, //go to body and find name=name
   type: req.body.type, //go to body and find name=type
   place: req.body.place, //go to body and find name=place
   description: req.body.description,
   sex: req.body.sex,
   age: parseInt(req.body.age, 10),
   size: req.body.size,
   vaccinated: req.body.vaccinated == 1,
   primaryColor: req.body.primaryColor,
   secondaryColor: req.body.secondaryColor,
   weight: parseInt(req.body.weight, 10),
   intakeDate: req.body.intake
  }
  // db.add(animal) = Add an form submid.
  if(db.add(animal)){
    res.redirect('/added/' + db.add(animal).id)
  }
  else {
    result.errors.push({
      id: 422,
      data: "422 - unprocessable entity"});

    res
      .status(422)
      .render('error.ejs', Object.assign({}, result, helpers))
      return;
  }
}


// Bronen
//Row 125 - 127 STATUS JSON
// https://stackoverflow.com/questions/26066785/proper-way-to-set-response-status-and-json-content-in-a-rest-api-made-with-nodej

// row 156 FORM
// https://www.youtube.com/watch?v=rin7gb9kdpk
