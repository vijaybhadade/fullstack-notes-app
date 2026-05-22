const express = require("express");
const app = express();

const userNotes = require("./routers/notes");
const userRouter = require("./routers/userRouter");
const path = require("path");
const cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.static("public"));


app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

const port = process.env.PORT || 3000;

app.use("/notes", userNotes);
app.use("/users", userRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});