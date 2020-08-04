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

const questions = [{
    type: "list",
    message: "What would you like to do?",
    name: "answer",
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
    prompt(questions.then((answer) => {
        switch (answer.action) {
            case "View all employees by department":
            printAllByDepartment();
        }}
    ));
}

function printAllByDepartment() {
    
}