const express = require("express")
const mongoose = require("mongoose")
const cors = require('cors')
const multer = require("multer")
const path = require("path")


const server = express()
const port = 4321
server.set("view engine", "ejs")
server.use(express.static('public'));
server.use(express.json())
server.use(cors())
server.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb+srv://kyy:123123123k123@webcluster.n79ny.mongodb.net/users")
const userSchema = new mongoose.Schema({
  fullname: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
})

const userModel = mongoose.model("userLogin", userSchema)

const foodSchema = new mongoose.Schema({
  title: { type: String, required: true }, // Corrected spelling of 'title'
  ingredient: { type: String, required: true }, // Or use Array if you want a list of ingredients
  pic: { type: String, required: true } // Assuming it's an image URL; use Buffer for file uploads
});

const recipeModel = mongoose.model('Recipe', foodSchema);

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');  // Destination folder for images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Unique filename
  }
});

const upload = multer({ storage: storage });


server.listen(port,() => {
console.log(`Server: server is running at http://localhost:${port}`)
})



// const database = mysql.createConnection({
//     host: 'localhost',
//     user: 'root',
//     password: '',
//     database: 'webdevproject',
// })
// database.connect((error) =>{
//     if(error){
//         console.error('Database not connected')
//         return
//     }
//     console.log("Database: Database is connected!")
// })


server.get("/", (req, res) => {
    res.render("login", {});
  })

  server.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Find user in the database
      const user = await userModel.findOne({ username });
  
      if (!user) {
        return res.status(400).send("Invalid username or password.");
      }
  
      // Check if the password matches
      if (user.password !== password) {
        return res.status(400).send("Invalid username or password.");
      }
  
      // If login is successful, redirect to the home page
      res.redirect("/home");
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).send("Error during login. Please try again.");
    }
  });
  
  server.post("/signup", async (req, res) => {
    try {
      const { fullname, username, email, password, confirm_password } = req.body;
  
      // Validate password match
      if (password !== confirm_password) {
        return res.status(400).send("Passwords do not match.");
      }
  
      // Create a new user object
      const newUser = new userModel({
        fullname,
        username,
        email,
        password, // Store plain text password (not recommended in real projects)
      });
  
      // Save the user to the database
      await newUser.save();
  
      // Redirect to login page on success
      res.redirect("/");
    } catch (error) {
      console.error("Error during registration:", error);
  
      if (error.code === 11000) {
        return res.status(400).send("Username or email already exists.");
      }
  
      res.status(500).send("Error during registration. Please try again.");
    }
  });

  server.get("/register", (req,res) => {
    res.render("register", {})
  })

  server.get("/home", (req,res) => {
    res.render("home", {})
  })


 server.get("/share", (req,res) => {
    res.render("share", {})
  })

  server.post("/share", upload.single('pic'), async (req, res) => {
    try {
      const { title, ingredient } = req.body;
      const pic = req.file ? `/uploads/${req.file.filename}` : '';  // Get file path
  
      // Create a new recipe object
      const newRecipe = new recipeModel({
        title,
        ingredient,
        pic
      });
  
      // Save the recipe to the database
      await newRecipe.save();
  
      // Redirect to the home page or wherever you want after submission
      res.redirect("/home");
  
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).send("Error saving the recipe.");
    }
  })

// Route to render the menu page with the recipes
server.get("/menu", async (req, res) => {
  try {
    // Fetch all recipes from the database
    const recipes = await recipeModel.find();

    // Render menu.ejs and pass the recipes data
    res.render("menu", { recipes });
  } catch (error) {
    console.error("Error fetching recipes:", error);
    res.status(500).send("Error fetching recipes.");
  }
});

// Route to handle the order using AJAX
server.post("/order", async (req, res) => {
  try {
    const { recipeId } = req.body;

    // Simulate an order being placed (this is where you'd typically process the order)
    const recipe = await recipeModel.findById(recipeId);

    if (!recipe) {
      return res.status(404).json({ success: false, message: 'Recipe not found.' });
    }

    // Assuming the order is placed successfully, send a success response
    res.json({ success: true });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: 'Error placing order.' });
  }
});
