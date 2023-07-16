const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()

let parser = bodyParser.urlencoded({extended: false});

app.use(parser);

app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

let mongoose = require("mongoose");

let Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let userSchema = new Schema
(
  {
    username : {type: String, required : true}
  }
)

let exerciseSchema = new Schema
(
  {
    description : {type: String, required : true},
    duration : {type: Number, required : true},
    date : {type: String, required : true},
    userId : {type: String, required : true}
  }
)

let userModel = mongoose.model("Users", userSchema);

let exerciseModel = mongoose.model("Exercises", exerciseSchema);

app.post("/api/users", async function(req, res){
  let username = req.body.username
  let newUser = new userModel({username});

  try{
    let user = await newUser.save();
    res.json(user);
  }
  catch(err){
    console.log(err);
  }
})

app.get("/api/users", async function(req, res){
  try{
    let people = await userModel.find();
    res.json(people);
  }
  catch(err){
    console.log(err);
  }
})

class singleExerciseDTO{
  constructor(exercise){
    this.description = exercise.description;
    this.date = exercise.date;
    this.duration = exercise.duration;
  }
}

class userExerciseDTO extends singleExerciseDTO{
  constructor(exercise, user){
    super(exercise);
    this.username = user.username;
    this._id = user._id;
  }
}

class userLogDTO{
  constructor(user, arrayOfExercises){
    this.username = user.username;
    this._id = user._id;
    this.count = arrayOfExercises.length;
    this.log = arrayOfExercises ?? [];
  }
}

app.post("/api/users/:_id/exercises", async function(req, res){
  let requestBody = req.body;

  let userId = req.params._id;

  let description = requestBody.description
  let duration = requestBody.duration
  let date = requestBody.date

  if(!date) {
    date = new Date().toDateString();
  }
  else{
    date = new Date(date).toDateString();
  }

  try{
    let user = await userModel.findById(userId);

    let newExercise = new exerciseModel({userId, description, duration, date})
    let exercise = await newExercise.save();
    let returnObject = new userExerciseDTO(exercise, user);

    res.json(returnObject);
  }
  catch(err){
    console.log(err);
  }
})

app.get("/api/users/:_id/logs", async function(req, res){
  let userId = req.params._id;

  try{
    let user = await userModel.findById(userId);

    let exerciseSearchObject = {userId : user._id};

    let exercises = await exerciseModel.find(exerciseSearchObject);

    let arrayOfExercisesDTO = exercises.map(el => {return {...new singleExerciseDTO(el)}}); 

    let log = new userLogDTO(user, arrayOfExercisesDTO);
    
    console.log(log);
    res.json(log);
  }
  catch(err){
    console.log(err);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
