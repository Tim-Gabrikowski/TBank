const router = require("express").Router();
const database = require("../database");

const { authenticateToken } = require("../auth");

router.post("/", authenticateToken, (req, res) => {
	const { from, to, amount, userKey, reason } = req.body;
	if (amount <= 0)
		return res
			.status(400)
			.send({ message: "only positive amount of credits" });
	if (from == to) return res.status(403).send({ message: "don't do so" });

	database.getAccountByNumber(from).then((accounts) => {
		if (req.software.trusted) {
			if (accounts[0].userKey != userKey) return res.sendStatus(403);
			var transaction = {
				fromAcc: from,
				toAcc: to,
				amount: amount,
				status: 1,
				userKey: userKey,
				softwareName: req.software.softwareName,
				reason: reason,
			};
			database.addTransaction(transaction).then((backTrtansaction) => {
				res.send(backTrtansaction);
			});
		} else {
			if (accounts[0].userKey != userKey) return res.sendStatus(403);
			database
				.getAccountById(req.software.accountId)
				.then((softwareAcc) => {
					var transaction = {
						fromAcc: from,
						toAcc: softwareAcc[0].accountNumber,
						amount: amount,
						status: 1,
						userKey: userKey,
						softwareName: req.software.softwareName,
						reason: reason,
					};
					database
						.addTransaction(transaction)
						.then((backTrtansaction) => {
							res.send(backTrtansaction);
						});
				});
		}
	});
});

module.exports = router;
