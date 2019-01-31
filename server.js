const express = require('express');
const mustacheExpress = require('mustache-express');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
// const http = require('http').Server(express);
var bodyParser = require('body-parser');
// const socketio = require('socket.io')(http);
var cookieParser = require('cookie-parser');
var flash = require('connect-flash');

const db_name = "ecommerce";

var mongoDb;

// var socketObject;

MongoClient.connect('mongodb://localhost:27017', function (err, client) {
    if (err) {
        console.log("Could not connect to the DB");
    } else {
        console.log("Connected");
        mongoDb = client.db(db_name);
    }
});

const app = express();

app.use(cookieParser('secret'));

// app.use(session({cookie: { maxAge: 60000 }}));

app.use(flash());

app.use(express.static(__dirname + "/public")); 

app.use(bodyParser.urlencoded({extended: true}));

app.engine("html", mustacheExpress());

app.set("view engine", "html");

app.set("views", __dirname + "/views");

app.set("layout", "layout/layout");


//home page 
app.get("/", (req, res) => {
    mongoDb.collection('items').find().toArray(function(err, data) {
        res.render("home.html", { products: data });
    });
})

app.get("/form", (req, res) => {
    res.render("form.html");
});

app.get("/about", (req, res) => {
    res.render("about.html");
});

app.get("/contact", (req, res) => {
    res.render("contact.html");
});

//html form to create product
app.get("/form", (req, res) => {
    res.render("form.html");
})

//form submitted POST 
app.post("/product/create", (req, res) => {
    mongoDb.collection("items").save(req.body, (err, result) => {
        if (err)
        {
            console.log(err);
        }else{

        //io.sockets.emit("product_added");
        console.log("Saved");
        res.redirect('/');
        }
      //  console.log("Savdsadasdsasdaed");
      });
});

//cart
app.get("/cart", (req, res) => {
    mongoDb.collection('carts').find().toArray(function(err, data) {
        res.render("cart.html", { carts: data });
    });
})

//create cart
app.post("/product/cart", (req, res) => {
    mongoDb.collection("carts").save(req.body, (err, result) => {
        if (err)
        {
            console.log(err);
        }else{

        //io.sockets.emit("product_added");
        console.log("Saved");
        res.redirect('/cart');
        }
      //  console.log("Savdsadasdsasdaed");
      });
});

//go to checkoutform
app.get("/checkedOut-:id", (req, res) => {
    const id = req.params.id;
        mongoDb.collection('carts').findOne({ _id: new ObjectID(id)}, (err, data) => {
        res.render("checkoutForm.html", { carts: data });
    });
})

//checkout one item
app.post("/product/cart/:id/checkedOut", (req, res) => {
    id = req.params.id
    mongoDb.collection("carts").removeOne(
        {
             _id: new ObjectID(id)
        }, 
        (err, result) => {
        if (err) return console.log(err)

        req.flash('success', 'Thank you for shopping!');
        res.locals.message = req.flash();
        console.log("checked out");
        res.redirect('/cart')
      })
});

//checkoutAll
app.get("/checkoutAll", (req, res) => {
    mongoDb.collection('carts').find().toArray(function(err, data) {
        res.render("checkoutAll.html", { carts: data });
    });
})

//checkedOut Ok
app.post("/checkedoutAll", (req, res) => {
    mongoDb.collection('carts').drop(function(err, data) {
        res.redirect('/');
    });
})

// viewing of product if quick view clicked
app.get("/:id", (req, res) => {
    const id = req.params.id;
    mongoDb.collection('items').findOne({ _id: new ObjectID(id)}, (err, data) => {
        res.render("product.html", { products: data });
    });
})

//login html form
app.get("/login", (req, res) => {
   // mongoDb.collection('carts').find().toArray(function(err, data) {
    const authPage = require('./pages/auth');

    res.send(authPage.html);
   // });
})

//login
app.post("/login", (req, res) => {
    const email = req.body.email;

    const password = req.body.password;

    if (email === "a@gmail.com"  && password === "rightpassword") {
        res.redirect("/");
    } else {
        res.redirect("/auth");
    }
});

//create account form
app.get("/createAccount", (req, res) => {
    // mongoDb.collection('carts').find().toArray(function(err, data) {
     const createAcc = require('./pages/createAccount');
 
     res.send(createAcc.html);
     console.log("fda");
    // });
 })

//create account method post
app.post("/createAccount", (req, res) => {
    console.log("post method");
    mongoDb.collection("accounts").save(req.body, (err, result) => {
        if (err)
        {
            console.log(err);
        }else{
        console.log("Created");
        res.redirect('/cart');
        }
      //  console.log("Savdsadasdsasdaed");
      });
});

//remove item from cart
app.post("/product/cart/:id/delete", (req, res) => {
    id = req.params.id
    mongoDb.collection("carts").removeOne(
        {
             _id: new ObjectID(id)
        }, 
        (err, result) => {
        if (err) return console.log(err)

        console.log("removed");
        res.redirect('/cart')
      })
});

app.listen(3000);

