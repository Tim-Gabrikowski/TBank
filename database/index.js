const Secuelize = require("sequelize");
require("dotenv").config();

const createUserOnSync = false;

var con = new Secuelize(
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
			type: Secuelize.INTEGER,
			unique: "accNum",
		},
		credits: {
			type: Secuelize.INTEGER,
		},
		userId: {
			type: Secuelize.INTEGER,
		},
		accName: {
			type: Secuelize.STRING,
		},
	},
	{
		paranoid: true,
	}
);
var Token = con.define("token", {
	softwareName: {
		type: Secuelize.STRING,
	},
	token: {
		type: Secuelize.STRING,
	},
	trusted: {
		type: Secuelize.BOOLEAN,
		default: false,
	},
});
var Transaction = con.define("transaction", {
	amount: {
		type: Secuelize.INTEGER,
	},
	status: {
		type: Secuelize.INTEGER,
		default: 1,
	},
	fromAcc: {
		type: Secuelize.INTEGER,
	},
	toAcc: {
		type: Secuelize.INTEGER,
	},
	softwareName: {
		type: Secuelize.STRING,
	},
	userId: {
		type: Secuelize.INTEGER,
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
};
