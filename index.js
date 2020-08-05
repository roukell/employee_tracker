const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();
const fs = require("fs");
const mysql = require("mysql");
const cTable = require('console.table');

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    init();
});

const question = [{
    type: "list",
    message: "What would you like to do?",
    name: "action",
    choices: [
        "View all employees by department",
        "View all employess by manager",
        "Add employee",
        "Remove employee",
        "Update employee role",
        "Update employee manager",
        "View all roles"
    ]
}];

function init() {
    prompt(question)
    .then((answer) => {
        switch (answer.action) {
            case "View all employees by department":
              printAllByDepartment();
              break;
    }
});
}

const printAllByDepartment = () => {
    let query = "SELECT * FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON department.id = role.department_id WHERE department.id = ?;"

    connection.query(query, [1], function(err, res) {
        if (err) throw err;
        console.log(res);
        })
}