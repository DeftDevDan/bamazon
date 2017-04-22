var inquirer = require('inquirer');

start();

function start() {
	inquirer.prompt(
		{
			type: "list",
			name:"choice",
			message: "Which menu would you like to access?",
			choices: ["Customer", "Manager", "Supervisor"]
		}
	).then(function(res) {
		switch(res.choice) {
			case "Customer":
				require('./bamazonCustomer');
				break;
			case "Manager":
				require('./bamazonManager');
				break;
			case "Supervisor":
				require('./bamazonSupervisor');
				break;
		}
	});
}