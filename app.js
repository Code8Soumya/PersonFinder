import "dotenv/config";
import rootDir from "./utils/path.js";
import path from "path";
import express from "express";
import personRoutes from "./routes/personRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(rootDir, "public")));

app.set("view engine", "ejs");

app.use("/person", personRoutes.router);

app.get("/", (req, res) => {
    res.render("index");
});

const PORT = process.env.PORT;

async function startServer() {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

startServer();
