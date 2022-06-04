const express = require("express");
const app = express();

require("dotenv").config();

app.use(express.json());

app.use("/", (req, res) => {
	res.send({ okay: true });
});

app.listen(process.env.PORT, () => {
	console.log("Server on port:", process.env.PORT);
});
