const router = require("express").Router();
const database = require("../database");

const { authenticateToken } = require("../auth");

router.get("/get", authenticateToken, (req, res) => {
	const accountNum = req.query.accNum;
	database.getTransactions(accountNum).then((transactions) => {
		res.send(transactions);
	});
});
router.get("/status", authenticateToken, (req, res) => {
	var { transactionId } = req.query;
	database.getTransaction(transactionId).then((transactions) => {
		var transaction = transactions[0].dataValues;
		res.send(transaction);
	});
});
router.post("/accept", authenticateToken, (req, res) => {
	const { transactionId, fromAcc, userId } = req.body;
	const software = req.software;
	console.log(software);
	if (software.trusted != true)
		return res.status(403).send({ message: "software not trusted" });

	database.getAccountByNumber(fromAcc).then((accounts) => {
		var account = accounts[0];
		if (userId != account.userId)
			return res.status(403).send({ message: "not owner of account" });

		database.getTransaction(transactionId).then((transactions) => {
			console.log("getTransaction");
			var transaction = transactions[0].dataValues;
			if (transaction.fromAcc != fromAcc)
				res.status(403).send({ message: "account number not correct" });
			if (transaction.status != 1)
				return res.status(403).send({ message: "wrong transaction" });

			transaction.status = 2;

			console.log(transaction);
			database.setTransaction(transaction).then((newTransaction) => {
				console.log("setTransaction");
				database
					.getAccountByNumber(transaction.fromAcc)
					.then((fromAccounts) => {
						console.log("getAccountByNumber(from)");
						var fromAccount = fromAccounts[0].dataValues;
						database
							.getAccountByNumber(transaction.toAcc)
							.then((toAccounts) => {
								console.log("getAccountByNumber(to)");
								var toAccount = toAccounts[0].dataValues;

								console.log(fromAccount, toAccount);

								if (fromAccount.credits < transaction.amount) {
									res.status(400).send({
										message: "not enougth money!",
									});
									transaction.status = 4;
									database.setTransaction(transaction);
								} else {
									fromAccount.credits =
										fromAccount.credits -
										transaction.amount;
									toAccount.credits =
										toAccount.credits + transaction.amount;

									database
										.updateAccount(fromAccount)
										.then((resA) => {
											console.log("updateAccount(from)");
											database
												.updateAccount(toAccount)
												.then((resB) => {
													console.log(
														"updateAccount(to)"
													);
													transaction.status = 3;
													database
														.setTransaction(
															transaction
														)
														.then((resC) => {
															console.log(
																"setTransaction"
															);
															res.send(
																transaction
															);
															console.log(
																"res send"
															);
														});
												});
										});
								}
							});
					});
			});
		});
	});
});

router.post("/reject", authenticateToken, (req, res) => {
	var { transactionId } = req.body;
	if (typeof transactionId == "undefined")
		return res.status(400).send({ message: "no transaction" });
	if (!req.software.trusted)
		return res.status(403).send({ message: "software not trusted" });

	database.getTransaction(transactionId).then((transactions) => {
		var transaction = transactions[0].dataValues;
		if (transaction.status != 1)
			return res.status(403).send({ message: "transaction not pending" });

		transaction.status = 4;

		database.setTransaction(transaction).then((resA) => {
			res.send(transaction);
		});
	});
});

module.exports = router;
