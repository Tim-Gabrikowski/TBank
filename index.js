const express = require("express");
const app = express();

const accRouter = require("./accounts");
const softwareRouter = require("./auth");
const transferRouter = require("./transfer");
const transactionsRouter = require("./transactions");

require("dotenv").config();

app.use(express.json());

app.use("/accounts", accRouter);
app.use("/software", softwareRouter.router);
app.use("/transfer", transferRouter);
app.use("/transactions", transactionsRouter);

app.get("/", (req, res) => {
	res.send({ path: "/", ok: true });
});

app.listen(process.env.PORT, () => {
	console.log("Server on port:", process.env.PORT);
});
