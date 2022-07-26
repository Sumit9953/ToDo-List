const express = require("express");
const bodyparser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
// const date = require(__dirname + "/date.js");

const app = express();


app.set('view engine','ejs');
app.use(bodyparser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://sumit:test123@cluster0.qjoy0ur.mongodb.net/todolistDB");

const itemSchema = {
  name:String,
};

const Item = mongoose.model("item",itemSchema);

const item1  = new Item({
  name:"Welcom to your todolist !"
});
const item2  = new Item({
  name:"hit the + button to add"
});
const item3  = new Item({
  name:"<--hit this to delete the item"
});

const defaultItem = [item1,item2,item3];

const listSchema = {
  name:String,
  items:[itemSchema]
};

const List = mongoose.model("List",listSchema);

app.get("/",function (req,res) {


  Item.find({},function (err,foundItems) {

    if(foundItems.length === 0){
      Item.insertMany(defaultItem,function (err) {
        if(err){
          console.log(err);
        }else{
          console.log("susseccfully added");
        }
      });
      res.redirect("/");
    }else{
      res.render("list",{listTitle:"Today", newListitems:foundItems});
    }
  });

});

app.get("/:customName",function (req,res) {
  const customListName = _.capitalize(req.params.customName);

List.findOne({name:customListName},function (err, foundList) {
  if(!err){
    if(!foundList){
      const list = new List({
        name:customListName,
        items:defaultItem
      });

    list.save();
    res.redirect("/" + customListName)
      // console.log("does not exists !");
    }else{

      res.render("list",{listTitle:foundList.name, newListitems:foundList.items});
      // console.log("Exists !");
    }
  }
});



});
app.post("/",function (req,res) {
  const itemName = req.body.newitem;
  const listName = req.body.list;

  const item = new Item({
    name:itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function (err,foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

});

app.post("/delete",function(req,res) {
  // console.log(req.body.checkbox);
   const checkedItemID = req.body.checkbox;
   const listName = req.body.listName;

   if(listName === "Today"){
     Item.findByIdAndRemove(checkedItemID.trim(),function (err) {
       if(err){
         console.log(err);
       }else{
         console.log("susseccfully removing");
         res.redirect("/");
       }
     });
   }else{
     List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemID.trim()}}},function (err,foundList) {
       if(!err){
         res.redirect("/" + listName);
       }
     });
   }

});



// app.get("/work",function (req,res) {
//   res.render("list",{listTitle:"work List",newListitems:workitems});
// });
app.get("/about",function (req,res) {
  res.render("about");
});

// app.post("/work",function(req,res) {
//
//   let item = req.body.newitem;
//   workitems.push(item);
//   res.redirect("/work");
// });
app.listen(3000,function () {
  console.log("server started on port 3000");
});
