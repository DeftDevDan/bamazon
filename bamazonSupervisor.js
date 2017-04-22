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
			type: "list",
			name: "choice",
			message: "What would you like to do?",
			choices: ["View Product Sales By Department", "Create New Department"]
		}
	).then(function(res){
		switch(res.choice) {
			case "View Product Sales By Department":
				viewByDept();
				break;
			case "Create New Department":
				createDept();
				break;
		}
	});
}

function viewByDept() {
	console.log("View By Department was selected");
	var query = 'SELECT *, (total_sales - over_head_costs) AS total_profit FROM departments';
	connection.query(query, function(err, res){
		if(err) throw err;
		console.table(res);
		next();
	});
}

function createDept() {
	inquirer.prompt([
		{	
			name: 'deptName',
			message: "What is the department name?"
		},
		{
			name: 'ohc',
			message: "What is the overhead cost?",
			validate: function(value) {
				if(isNaN(value) === false && parseInt(value) > 0) {
					return true;
				} else {
					return false;
				}
			}
		}
	]).then(function(res) {
		var query = 'INSERT INTO departments (department_name, over_head_costs, total_sales) VALUES(?, ?, 0)';
		connection.query(query, [res.deptName, res.ohc], function(err, res) {
			if(err) throw err;
		});
		next();
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

module.exports = startPrompt;