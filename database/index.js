const Sequelize = require("sequelize");
require("dotenv").config();

const createUserOnSync = false;

var con = new Sequelize(
	process.env.DATABASE_NAME,
	process.env.DATABASE_USERNAME,
	process.env.DATABASE_PASSWORD,
	{
		port: process.env.DATABASE_PORT,
		host: process.env.DATABASE_HOST,
		logging: console.log,
		dialect: "mysql",
	}
);

var Account = con.define(
	"account",
	{
		accountNumber: {
			type: Sequelize.INTEGER,
			unique: "accNum",
		},
		credits: {
			type: Sequelize.INTEGER,
		},
		userId: {
			type: Sequelize.INTEGER,
		},
		accName: {
			type: Sequelize.STRING,
		},
	},
	{
		paranoid: true,
	}
);
var Token = con.define("token", {
	softwareName: {
		type: Sequelize.STRING,
	},
	token: {
		type: Sequelize.STRING,
	},
	trusted: {
		type: Sequelize.BOOLEAN,
		default: false,
	},
});
var Transaction = con.define("transaction", {
	amount: {
		type: Sequelize.INTEGER,
	},
	status: {
		type: Sequelize.INTEGER,
		default: 1,
	},
	fromAcc: {
		type: Sequelize.INTEGER,
	},
	toAcc: {
		type: Sequelize.INTEGER,
	},
	softwareName: {
		type: Sequelize.STRING,
	},
	userId: {
		type: Sequelize.INTEGER,
	},
	reason: {
		type: Sequelize.STRING,
	},
	isGiftCard: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
	},
	giftCardId: {
		type: Sequelize.INTEGER,
	},
});
const GiftCard = con.define("giftcard", {
	code: {
		type: Sequelize.STRING,
		unique: "code",
		allowNull: false,
	},
	amount: {
		type: Sequelize.INTEGER,
	},
	reason: {
		type: Sequelize.STRING,
	},
	used: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
	activated: {
		type: Sequelize.BOOLEAN,
		defaultValue: false,
		allowNull: false,
	},
});

Account.hasOne(Token);
Token.belongsTo(Account);

con.sync({ alter: true })
	.then(() => {
		console.log("___________");
		console.log("SYNC COMPLETE!");
		console.log("");
	})
	.catch((error) => {
		console.log(error);
		console.log("___________");
		console.log("SYNC FAILED!");
		console.log("");
	});

function getMyAccounts(uid) {
	return Account.findAll({ where: { userId: uid } });
}
function registerSoftware(software) {
	return Token.create(software);
}
function createNewAccount(account) {
	return Account.create(account);
}
function getSoftwareByToken(token) {
	return Token.findAll({ where: { token: token } });
}
function getAccountByNumber(num) {
	return Account.findAll({ where: { accountNumber: num } });
}
function updateAccount(account) {
	return Account.update(account, { where: { id: account.id } });
}
function getAccountById(id) {
	return Account.findAll({ where: { id: id } });
}
function trustSoftware(token) {
	return Token.update({ trusted: true }, { where: { token: token } });
}
function addTransaction(transaction) {
	return Transaction.create(transaction);
}
function getTransactions(accountNum) {
	return Transaction.findAll({ where: { fromAcc: accountNum } });
}
function getUserTransactions(uid) {
	return Transaction.findAll({ where: { userId: uid } });
}
function getTransaction(id) {
	return Transaction.findAll({ where: { id: id } });
}
function setTransaction(transaction) {
	return Transaction.update(transaction, { where: { id: transaction.id } });
}
function createGiftCard(card) {
	return GiftCard.create(card);
}
function getGiftCard(code) {
	return GiftCard.findAll({ where: { code: code } });
}
function getGiftCardId(id) {
	return GiftCard.findAll({ where: { id: id } });
}
function updateGiftCard(card) {
	return GiftCard.update(card, { where: { id: card.id } });
}

module.exports = {
	getMyAccounts,
	registerSoftware,
	createNewAccount,
	getSoftwareByToken,
	getAccountByNumber,
	trustSoftware,
	addTransaction,
	getAccountById,
	getTransactions,
	getTransaction,
	setTransaction,
	updateAccount,
	getUserTransactions,
	createGiftCard,
	getGiftCard,
	getGiftCardId,
	updateGiftCard,
};
