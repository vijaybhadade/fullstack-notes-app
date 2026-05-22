const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const pool = require("../Pool");

//post notes
router.post("/", authMiddleware,async(req, res) =>  {
    const { title, content } = req.body;

    if (!title || !content || !title.trim() || !content.trim()) {
        return res.status(400).send("All filed required");
    };
    try
    {
     const result=await pool.query("insert into notes(title,content,user_id) values($1,$2,$3) RETURNING *",[title,content,req.user.id]);

    res.status(201).json(result.rows[0]);
    }
    catch(error)
    {
        console.error("Error:");
        res.status(400).send("Error inserting notes");
    }
    
});

//show all notes
router.get("/",authMiddleware, async (req, res) => {
   
    const result= await  pool.query("SELECT * from notes where user_id=$1",[req.user.id]);

    res.json(result.rows);
});

//get single
router.get("/:id",authMiddleware,async(req,res)=>{
    const id =  parseInt(req.params.id);

    try
    {
        const result=await pool.query(
            "SELECT * FROM notes WHERE id=$1 and user_id=$2",[id,req.user.id]
        );

       if(result.rows.length===0)
       {
        return res.status(404).send("Note not found or unauthorized");
       }
       res.json(result.rows[0]);
    }
    catch(error)
    {
        console.log("Error",error.message);
        res.status(500).send("Error fetching notes");
    }
});

//update notes
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
router.delete("/:id",authMiddleware, async(req,res)=>{
    const id=parseInt(req.params.id);

    try{
        const result =await pool.query(
            "DELETE  FROM notes WHERE id=$1 and user_id=$2 RETURNING * ",[id,req.user.id]
        );

        if(result.rows.length===0)
        {
            return res.status(404).send("Note not found or unauthorized..");
        }
        res.json({
            message:"Note deleted successfully..",
            note:result.rows[0]
        });

    }catch(error)
    {
        console.error("Error deleting note: ",error.message);
        res.status(500).send("Error deleting  note");
    }
});



module.exports = router;