const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
    exposedHeaders: ['Content-Disposition']
}));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

app.use("/api", require("./routes"));

app.get("/", (req, res) => {
    res.send("This is the API for Kalo Adoptions");
});

app.use((err, req, res, next) => {
    console.error(err);

    const isMulterError = err?.name === 'MulterError';
    const statusCode = isMulterError ? 400 : err.statusCode || 500;
    const message = isMulterError && err.code === 'LIMIT_FILE_SIZE'
        ? 'Image file is too large'
        : err.message || 'Error interno del servidor';

    res.status(statusCode).json({
        ok: false,
        message
    });
});

module.exports = app;
