const express = require("express");
const app = express();
const userNotes = require("./routers/notes");
const userRouter = require("./routers/userRouter");
const cors=require("cors");

app.use(cors());
app.use(express.static("public"));
app.use(express.json());

const port = 3000;

app.use("/notes", userNotes);
app.use("/users", userRouter);


// Removed (req, res) from the callback
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});