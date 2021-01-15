//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/todoListDB",{useNewUrlParser:true});
const todoSchema = {
  name: String
};
const todoItem = mongoose.model("todoItem", todoSchema);
const item1 = new todoItem({
  name: "cooking"
});
const item2 = new todoItem({
  name: "bathing"
});
const item3 = new todoItem({
  name: "running"
});
const defaultItems = [item1, item2, item3]; //way to insert many items in mongo db.


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));


const workItems = [];

app.get("/", function(req, res) {

  const day = date.getDate();

  todoItem.find({}, function(error, item) { // in db all items are js objects which are in array automatically item is that array.
    if (item.length === 0) {
      todoItem.insertMany(defaultItems, function(err) { //to save the default items in db.
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully inserted default items!!");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: day,
        newListItems: item
      });
    }

  });


});

const day = date.getDate();
app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const submit=req.body.buttonName;
      const item=new todoItem({
      name:itemName
    });
    if(submit===day){
      item.save();
      res.redirect("/");
}else{
  customList.findOne({name:submit},function(err,found){
    found.customItem.push(item);
    found.save();
    res.redirect("/"+submit);
  });
}

});

app.post("/delete",function(req,res){   //value of input in form gives the value specified as req
const checkid=req.body.checkboxName;
const hidden =req.body.hiddenSubmit;
if(hidden===day){
todoItem.findByIdAndRemove(checkid,function(err){
  if(!err){
    console.log("successfully deleted checked item");
    res.redirect("/");
  }
});

}else{
  customList.findOneAndUpdate({name:hidden},{$pull:{customItem:{_id:checkid}}},function(err,found){
    if(!err){  // $pull deletes item of an array. 
      res.redirect("/"+hidden);
    }
  });
}

});


app.get("/:custom",function(req,res){
  const customName=req.params.custom;

  customList.findOne({name:customName},function(err,foundItem){
    if(!err){
    if(!foundItem){
      const NewCustomCollection=new customList({
        name:customName,
        customItem:defaultItems
      });
      NewCustomCollection.save();
      res.redirect("/"+customName);
    }else{
      res.render("list",{listTitle:foundItem.name,  newListItems: foundItem.customItem});
    }
  }
  });
});

const customSchema=new mongoose.Schema({
  name:String,
  customItem:[todoSchema]
});

const customList=mongoose.model("customList",customSchema);



app.listen(3030, function() {
  console.log("Server started on port 3030");
});
