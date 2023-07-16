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

let userModel = mongoose.model("Users", userSchema);

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
    people = await userModel.find();
    res.json(people);
  }
  catch(err){
    console.log(err);
  }
})

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
