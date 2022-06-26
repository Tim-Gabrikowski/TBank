const express = require("express");
var router = express.Router();

const database = require("../database");
const { randomBytes } = require("crypto");

const { authenticateToken } = require("../auth");

router.get("/", (req, res) => {
	res.send({ path: "/giftcards", ok: true });
});
router.get("/card/:code", (req, res) => {
	const code = req.params.code;
	database.getGiftCard(code).then((cards) => {
		res.send(cards[0]);
	});
});
router.post("/new", authenticateToken, (req, res) => {
	const { amount, reason, fromAcc, userId } = req.body;

	if (amount <= 0)
		return res
			.status(400)
			.send({ message: "only positive amount of credits" });
	if (!req.software.trusted)
		return res.status(403).send({ message: "Software not trusted" });

	const code = randomBytes(8).toString("hex");

	database.getAccountByNumber(fromAcc).then((accs) => {
		if ((accs[0].dataValues.userId = !userId))
			return res.status(400).send({ message: "account not matching" });
		var giftcard = { amount: amount, code: code, reason, reason };
		database.createGiftCard(giftcard).then((backCard) => {
			giftcard = backCard.dataValues;
			var transaction = {
				fromAcc: fromAcc,

				amount: amount,
				status: 1,
				userId: userId,
				softwareName: req.software.softwareName,
				reason: "Giftcard",
				isGiftCard: true,
				giftCardId: giftcard.id,
			};
			database.addTransaction(transaction).then((backTransaction) => {
				res.send({ card: giftcard, transaction: backTransaction });
			});
		});
	});
});
router.post("/use", (req, res) => {
	const { code, accountNum } = req.body;

	database.getGiftCard(code).then((cards) => {
		if (cards.length != 1)
			return res.status(400).send({ message: "no such card" });

		var giftCard = cards[0].dataValues;

		if (!giftCard.activated)
			return res.status(400).send({ message: "card not activated" });
		if (giftCard.used)
			return res.status(400).send({ message: "card already used" });

		database.getAccountByNumber(accountNum).then((accounts) => {
			if (accounts.length != 1)
				return res.status(400).send({ message: "no such account" });
			var account = accounts[0].dataValues;

			account.credits += giftCard.amount;
			giftCard.used = true;
			database.updateGiftCard(giftCard).then((_) => {
				database.updateAccount(account).then((_) => {
					res.send(giftCard);
				});
			});
		});
	});
});

module.exports = router;
