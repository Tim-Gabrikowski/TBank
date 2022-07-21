const router = require("express").Router();
const database = require("../database");

const { authenticateToken } = require("../auth");

router.get("/get", authenticateToken, (req, res) => {
	const accountNum = req.query.accNum;
	const userKey = req.query.uid;

	if (typeof accountNum != "undefined") {
		database.getTransactions(accountNum).then((transactions) => {
			res.send(transactions);
		});
	} else if (typeof userKey != "undefined") {
		database.getUserTransactions(userKey).then((transactions) => {
			res.send(transactions);
		});
	} else {
		res.status(400).send({ message: "no search params" });
	}
});
router.get("/status", authenticateToken, (req, res) => {
	var { transactionId } = req.query;
	database.getTransaction(transactionId).then((transactions) => {
		var transaction = transactions[0].dataValues;
		res.send(transaction);
	});
});

/*
 *
 * Dear programmer:
 * When I wrote this code, only god and I knew how it worked.
 * Now, only god knows it!
 *
 * Therefore, if you are trying to optimize this and if you fail (most surely),
 * please increase this counter as a warning for the next persion:
 *
 * total_hours_wasted_here = 27
 *
 */
router.post("/accept", authenticateToken, (req, res) => {
	const { transactionId, fromAcc, userKey } = req.body;
	const software = req.software;

	if (software.trusted != true) return res.status(403).send({ message: "software not trusted" });

	database.getAccountByNumber(fromAcc).then((accounts) => {
		var account = accounts[0];
		if (userKey != account.userKey) return res.status(403).send({ message: "not owner of account" });

		database.getTransaction(transactionId).then((transactions) => {
			var transaction = transactions[0].dataValues;
			if (transaction.fromAcc != fromAcc) res.status(403).send({ message: "account number not correct" });
			if (transaction.status != 1) return res.status(403).send({ message: "wrong transaction" });
			if (transaction.fromAcc == transaction.toAcc) return res.status(403).send({ message: "don't do so!" });
			transaction.status = 2;

			database.setTransaction(transaction).then((newTransaction) => {
				database.getAccountByNumber(transaction.fromAcc).then((fromAccounts) => {
					var fromAccount = fromAccounts[0].dataValues;

					if (!transaction.isGiftCard) {
						database.getAccountByNumber(transaction.toAcc).then((toAccounts) => {
							var toAccount = toAccounts[0].dataValues;

							if (fromAccount.credits < transaction.amount) {
								res.status(400).send({
									message: "not enougth money!",
								});
								transaction.status = 4;
								database.setTransaction(transaction);
							} else {
								fromAccount.credits = fromAccount.credits - transaction.amount;
								toAccount.credits = toAccount.credits + transaction.amount;

								database.updateAccount(fromAccount).then((resA) => {
									database.updateAccount(toAccount).then((resB) => {
										transaction.status = 3;
										database.setTransaction(transaction).then((resC) => {
											res.send(transaction);
										});
									});
								});
							}
						});
					} else {
						database.getGiftCardId(transaction.giftCardId).then((cards) => {
							var card = cards[0].dataValues;
							if (cards.length != 1) return res.status(400).send({ message: "No gift card" });

							if (fromAccount.credits < transaction.amount) {
								res.status(400).send({
									message: "not enougth money!",
								});
								transaction.status = 4;
								database.setTransaction(transaction);
							} else {
								fromAccount.credits = fromAccount.credits - card.amount;
								database.updateAccount(fromAccount).then((_) => {
									card.activated = true;
									database.updateGiftCard(card).then((_) => {
										transaction.status = 3;
										database.setTransaction(transaction).then((_) => {
											res.send(transaction);
										});
									});
								});
							}
						});
					}
				});
			});
		});
	});
});

router.post("/reject", authenticateToken, (req, res) => {
	var { transactionId } = req.body;
	if (typeof transactionId == "undefined") return res.status(400).send({ message: "no transaction" });
	if (!req.software.trusted) return res.status(403).send({ message: "software not trusted" });

	database.getTransaction(transactionId).then((transactions) => {
		var transaction = transactions[0].dataValues;
		if (transaction.status != 1) return res.status(403).send({ message: "transaction not pending" });

		transaction.status = 4;

		database.setTransaction(transaction).then((resA) => {
			res.send(transaction);
		});
	});
});

module.exports = router;
