const express = require("express");
var router = express.Router();
const fetch = require("node-fetch");
require("dotenv").config();

const database = require("../database");

const { authenticateToken } = require("../auth");

router.get("/", (req, res) => {
	res.send({ path: "/accounts", ok: true });
});

router.get("/my", authenticateToken, (req, res) => {
	fetch(
		"https://imaginarysector.net/api/get-user/?username=" +
			req.query.uname +
			"&auth_key=" +
			process.env.IS_AUTH_KEY
	)
		.then((response) => response.json())
		.then((user) => {
			if (user.success == true) {
				database.getMyAccounts(user.user_key).then((accounts) => {
					res.send(accounts);
				});
			} else {
				res.send({
					message: "no user with username: " + req.query.uname,
				});
			}
		})
		.catch((error) => {
			res.status(500).send({
				message: "Error: External data can't be loadet.",
			});
		});
});
router.get("/one", authenticateToken, (req, res) => {
	const accountNumber = req.query.num;
	database.getAccountByNumber(accountNumber).then((accounts) => {
		res.send(accounts[0]);
	});
});
router.post("/new", authenticateToken, (req, res) => {
	const { user_key, name } = req.body;
	const accountNumber = getRandomNumberBetween(100000, 999999);
	const credits = 0;
	database
		.createNewAccount({
			accountNumber: accountNumber,
			credits: credits,
			userKey: user_key,
			accName: name,
		})
		.then((account) => {
			res.send(account);
		});
});

module.exports = router;

function getRandomNumberBetween(min, max) {
	return Math.floor(Math.random() * (max - min + 1) + min);
}
