//all this router important for using project 


//re-set password
router.patch("/set-password/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const { password } = req.body;

    if (!password || !password.length < 6) {
        return res.status(400).send("Password must be at 6 charecter");
    }



    try {
        const handlePassword = await bcrypt.hash(password, 10);

        await pool.query(
            "UPDATE users SET password=$1 where id=$2",
            [handlePassword, id]
        );
        if (password.rows.length === 0) {
            return res.status(401).send("user not found");
        }

        res.send("Password updated....");
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error updating password");
    }

});

//get single notes 
router.get("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes.find(ul => ul.id == id);
    if (!note) {
        return res.send("Given id does not exist in array");
    }

    res.json(note);

});


const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../Pool");


//show all notes
router.get("/",authMiddleware, async (req, res) => {
   
    const result= await  pool.query("SELECT * from notes where id=$1");

    res.json(result.rows);
});


//post notes
router.post("/", authMiddleware,async(req, res) =>  {
    const { title, content } = req.body;

    if (!title || !content || !title.trim() || !content.trim()) {
        return res.status(400).send("All filed required");
    };
    try
    {
     const result=await pool.query("insert into notes(title,content,user_id) values($1,$2,$3) RETURNING *")[title,content,req.user.id];

    res.status(201).json(result.rows[0]);
    }
    catch(error)
    {
        console.error("Error:");
        res.status(400).send("Error inserting notes");
    }

    
});

//get single notes 
router.get("/:id", (req, res) => {
    const id = parseInt(req.params.id);
    const note = notes.find(ul => ul.id == id);
    if (!note) {
        return res.send("Given id does not exist in array");
    }

    res.json(note);

});

//update
router.patch("/:id",authMiddleware, async (req, res) => {
    const id = parseInt(req.params.id);

    const { title, content } = req.body;

    if (!title &&  !content) {
       return res.status(400).send("Nothing to update");
    }
    try{
     const   result= await pool.query(
      "UPDATE notes  SET title = COALESCE($1, title), content = COALESCE($2, content) WHERE id = $3 AND user_id = $4 RETURNING *",[title,content,id,req.user.id]);
      if(result.rows.length===0)
      {
        return res.status(404).send("Note not found or  unauthorization");
      }
    res.json(result.rows[0]);
    }
   catch(error)
   {
    console.log(error.message);
    res.status(500).send("Error updating notes");
   }

});

//delete notes

router.delete("/:id", (req, res) => {
    const id = parseInt(req.params.id);

    const note = notes.find(n => n.id === id);

    if (!note) {
        return res.status(404).send("Note not found");
    }

    notes = notes.filter(n => n.id !== id);

    res.send("Note deleted successfully");
});









// CRITICAL MISSING LINE:
module.exports = router;