const express = require("express");
const router = express.Router();
const pool = require("../Pool");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");


router.get("/about",(req,res)=>{
    res.send("Welcome to my  about page...");
})

//  REGISTER (POST)
router.post("/register", async (req, res) => {
    const { username, email, age, password } = req.body;

    if (!username || !email || !age || !password) {
        return res.status(400).send("All fields required");
    }

    if (password.length < 6) {
        return res.status(400).send("Password must be at least 6 characters");
    }

    if (age <= 0) {
        return res.status(400).send("Age must be greater than zero");
    }

    if (!email.includes("@")) {
        return res.status(400).send("Invalid email");
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const result = await pool.query(
            "INSERT INTO users (username, email, age, password) VALUES ($1, $2, $3, $4) RETURNING id, username, email, age",
            [username, email, age, hashedPassword]
        );

        return res.status(201).json({
            message: "User Registered",
            user: result.rows[0]
        });

    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).send("Email already exists");
        }
        return res.status(500).send("Error inserting user");
    }
});


//Profile user
router.get("/profile", authMiddleware, async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT id, username, email, age FROM users WHERE id=$1",
            [req.user.id]
        );

        res.json(result.rows[0]);

    } catch (err) {
        res.status(500).send("Error fetching profile");
    }
});



//  LOGIN API
router.post("/login", async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send("Email and password required");
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE email=$1",
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        const user = result.rows[0];

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).send("Invalid password");
        }

        //token 
        const token = jwt.sign({
            id: user.id,
            username: user.username,
            email: user.email,
        }, "secretkey",
            { expiresIn: "1h" }
        );


        return res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                age: user.age
            }
        });

    } catch (error) {
        console.log("Login error :", error);
        return res.status(500).send("Error in login");
    }
});



// GET all users
router.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT id, username, email, age FROM users");
        return res.json(result.rows);
    } catch (err) {
        return res.status(500).send("Error fetching users");
    }
});




//  GET single user
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
        return res.status(400).send("Invalid Id");
    }

    try {
        const result = await pool.query(
            "SELECT id, username, email, age FROM users WHERE id=$1",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        return res.json(result.rows[0]);

    } catch (error) {
        console.log("Error:", error);
        return res.status(500).send("Error fetching user");
    }
});


// UPDATE user
router.patch("/:id", authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    const { username, email, age } = req.body;

    //check ownership
    if (req.user.id !== id) {
        return res.status(403).send("Unauthorization");
    }

    try {
        const result = await pool.query(
            `UPDATE users 
             SET username = COALESCE($1, username),
                 email = COALESCE($2, email),
                 age = COALESCE($3, age)
             WHERE id = $4 RETURNING id, username, email, age`,
            [username, email, age, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        return res.json(result.rows[0]);

    } catch (err) {
        if (err.code === "23505") {
            return res.status(400).send("Email already exists");
        }
        return res.status(500).send("Error updating user");
    }
});


//  DELETE user
router.delete("/:id", authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);
    console.log("ID", id);

    if (req.params.id !== id) {
        return res.status(403).send("Unauthorization");
    }

    try {
        const result = await pool.query(
            "DELETE FROM users WHERE id=$1 RETURNING id",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("User not found");
        }

        return res.send("User deleted successfully");

    } catch (err) {
        return res.status(500).send("Error deleting user");
    }
});





module.exports = router;