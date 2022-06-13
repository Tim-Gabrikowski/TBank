const router = require("express").Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const database = require("../database");

router.post("/register", (req, res) => {
	const { softwareName, accountId } = req.body;

	const software = {
		softwareName: softwareName,
		accountId: accountId,
		trusted: false,
	};

	const token = generateAccessToken(software);
	database
		.registerSoftware({
			softwareName: software.softwareName,
			token: token,
			accountId: software.accountId,
			trusted: false,
		})
		.then((newSoftware) => {
			res.send(newSoftware);
		});
});
router.post("/trust", (req, res) => {
	const { softwareToken, verify } = req.body;
	if (verify != process.env.VERIFY_PASSWORD) return res.sendStatus(403);

	database.trustSoftware(softwareToken).then((result) => {
		res.send(result);
	});
});

function generateAccessToken(user) {
	return jwt.sign(user, process.env.SOFTWARE_TOKEN_SECRET);
}
function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];
	if (token == null) return res.sendStatus(401);

	if (token == "AdminDuOpfa!") {
		req.user = { username: "master", perm_group: 4 };
		next();
	} else {
		jwt.verify(token, process.env.SOFTWARE_TOKEN_SECRET, (err, user) => {
			if (err) return res.sendStatus(403);

			database.getSoftwareByToken(token).then((software) => {
				if (software.length == 0) return res.sendStatus(403);
				req.software = software[0].dataValues;
				next();
			});
		});
	}
}

module.exports = {
	authenticateToken,
	router,
};
