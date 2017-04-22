var mysql = require("mysql");
var inquirer = require("inquirer");
require('console.table');

var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,

  user: "root",

  password: "bamazon",
  database: "bamazon"
});

connection.connect(function(err) {
	if (err) throw err;
	startPrompt();
});

var startPrompt = function() {
	inquirer.prompt(
		{
			name: "choice",
			type: "list",
			message: "What would you like to do?",
			choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"]
		}
	).then(function(res) {
		switch(res.choice) {
			case "View Products for Sale":
				viewProducts();
				break;
			case "View Low Inventory":
				viewLowInventory();
				break;
			case "Add to Inventory":
				addToInventory();
				break;
			case "Add New Product":
				addNewProduct();
				break;
		}
	});
}

function viewProducts() {
	var query = 'SELECT * FROM products';
	connection.query(query, function(err, res) {
		if(err) throw err;
		console.table(res);
		next();
	});
}

function viewLowInventory() {
	var query = 'SELECT * FROM products WHERE stock_quantity < 5';
	connection.query(query, function(err, res) {
		if(err) throw err;
		console.table(res);
		next();
	});
}

function addToInventory() {
	var query = 'SELECT * FROM products';
	var dbLength;
	connection.query(query, function(err, res) {
		if(err) throw err;
		console.table(res);
		invPrompt(res[res.length - 1].item_id, res);
	});	
}

function addNewProduct() {
	inquirer.prompt([
		{
			name: "prodName",
			message: "What is the name of the product?"
		},
		{
			name: "depName",
			message: "What is the name of the department?"
		},
		{
			name: "price",
			message: "What is the price?",
			validate: function(value) {
				if(isNaN(value) === false && parseInt(value) > 0) {
					return true;
				} else {
					return false;
				}
			}
		},
		{
			name: "stock",
			message: "How many do we have in stock?",
			validate: function(value) {
				if(isNaN(value) === false && parseInt(value) > 0) {
					return true;
				} else {
					return false;
				}
			}
		}
	]).then(function(r){
		var query = 'INSERT INTO products (product_name, department_name, price, stock_quantity) VALUES (?,?,?,?)';
		connection.query(query, [r.prodName.toString(), r.depName.toString(), parseFloat(r.price), parseInt(r.stock)], function(err, res) {
			if(err) throw err;
			next();
		});
	});
}

function next() {
	inquirer.prompt({
		type: "confirm",
		name: "confirmation",
		message: "Continue?"
	}).then(function(res) {
		if(res.confirmation) {
			startPrompt();
		} else {
			connection.end();
			return;
		}
	});
}

function invPrompt(dbLength, db) {
	inquirer.prompt([
		{
			name: "prodID",
			message: "What is the ID of the product you would like to update",
			validate: function(value) {
				if(isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <= dbLength) {
					return true;
				} else {
					return false;
				}
			}
		},
		{
			name: "quantity",
			message: "How many would you like to add to stock",
			validate: function(value) {
				if(isNaN(value) === false && parseInt(value) > 0) {
					return true;
				} else {
					return false;
				}
			}
		}
	]).then(function(response) {
		var stock = 50;
		for(var i = 0; i < db.length; i++) {
			if(db[i].item_id == response.prodID) {
				stock = parseInt(db[i].stock_quantity) + parseInt(response.quantity);
			}
		}

		var query = 'UPDATE products SET ? WHERE ?';
		connection.query(query, [{stock_quantity: stock},{item_id: response.prodID}], function(err, res) {
			if(err) throw err;
			next();
		});
	});
}

module.exports = startPrompt;