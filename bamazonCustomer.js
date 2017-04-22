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
	listProducts();
});

var listProducts = function() {
	var query = 'SELECT * FROM products';
	connection.query(query, function(err, res) {
		if(err) throw err;
		console.table(res);
		buyPrompt(res[res.length - 1].item_id);
	});
}

var buyPrompt = function(dbLength) {
	inquirer.prompt([
		{
			name: 'prodID',
			message: "What is the ID of the product you would like to purchase",
			validate: function(value) {
				if(isNaN(value) === false && parseInt(value) > 0 && parseInt(value) <= dbLength) {
					return true;
				} else {
					return false;
				}
			}
		},
		{
			name: 'quantity',
			message: "How many would you like?",
			validate: function(value) {
				if(isNaN(value) === false && parseInt(value) > 0) {
					return true;
				} else {
					return false;
				}
			}
		}
	]).then(function(response) {
		var query = 'SELECT * FROM products WHERE ?';
		connection.query(query, {item_id: response.prodID}, function (err, res) {
			if(response.quantity > res[0].stock_quantity) {
				console.log("We need more pylons");
				connection.end();
			} else {
				var update = res[0].stock_quantity - response.quantity;
				if(res[0].product_sales != undefined) {
					total = res[0].product_sales + (res[0].price * response.quantity);
				} else {
					total = res[0].price * response.quantity;
				}
				updateStock(update, response.prodID, res[0].price, response.quantity, total);
			}
		});
	});
}

function updateStock(quantity, id, price, purchased, total) {
	var query = 'UPDATE products SET ? WHERE ?';

	connection.query(query, [{stock_quantity: quantity, product_sales: total}, {item_id: id}], function(err) {
		if(err) throw err;
		console.log("Total cost of your purchase is: $" + purchased * price);
	})
	
	updateTotalSales();
}


function updateTotalSales() {
	var query = 'SELECT department_name, SUM(product_sales) AS product_sales FROM products GROUP BY department_name';

	connection.query(query, function(err, res) {
		if(err) throw err;

		for(var i = 0; i < res.length; i++) {
			var dept = res[i].department_name.toString();
			var sales = parseFloat(res[i].product_sales);

			updateDeptDB(dept, sales);
		}

		connection.end();

	});
}

function updateDeptDB(dept, sales) {
	var query = 'UPDATE departments SET ? WHERE ?';
	connection.query(query, [{total_sales: sales}, {department_name: dept}], function(err, res) {
		if(err) throw err;
	});
}

module.exports = listProducts;