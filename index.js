const express = require("express");
const app = express();
const cors = require("cors");

const accRouter = require("./accounts");
const softwareRouter = require("./auth");
const transferRouter = require("./transfer");
const transactionsRouter = require("./transactions");
const giftCardsRouter = require("./giftCards");

require("dotenv").config();

app.use(express.json());
app.use(cors());

app.use("/accounts", accRouter);
app.use("/software", softwareRouter.router);
app.use("/transfer", transferRouter);
app.use("/transactions", transactionsRouter);
app.use("/giftcards", giftCardsRouter);

app.get("/", (req, res) => {
	res.send({ path: "/", ok: true });
});

app.listen(process.env.PORT, "0.0.0.0", () => {
	console.log("Server on port:", process.env.PORT);
});
