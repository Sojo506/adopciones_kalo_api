const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

//app.use("/api/auth", require("./routes"));

app.get("/", (req, res) => {
    res.send("This is the API for Kalo Adoptions");
});

module.exports = app;