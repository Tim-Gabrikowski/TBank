const router = require("express").Router();
const database = require("../database");

const { authenticateToken } = require("../auth");

router.post("/", authenticateToken, (req, res) => {
	const { from, to, amount, userId } = req.body;

	database.getAccountByNumber(from).then((accounts) => {
		if (req.software.trusted) {
			if (accounts[0].userId != userId) return res.sendStatus(403);
			var transaction = {
				fromAcc: from,
				toAcc: to,
				amount: amount,
				status: 1,
				userId: userId,
				softwareName: req.software.softwareName,
			};
			database.addTransaction(transaction).then((backTrtansaction) => {
				res.send(backTrtansaction);
			});
		} else {
			if (accounts[0].userId != userId) return res.sendStatus(403);
			database
				.getAccountById(req.software.accountId)
				.then((softwareAcc) => {
					var transaction = {
						fromAcc: from,
						toAcc: softwareAcc[0].accountNumber,
						amount: amount,
						status: 1,
						userId: userId,
						softwareName: req.software.softwareName,
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
