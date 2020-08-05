const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();
const fs = require("fs");
const mysql = require("mysql");
const cTable = require('console.table');
const util = require("util");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "password",
    database: "employee_db"
});

connection.query = util.promisify(connection.query);

connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    init();
});

const generalQuestion = {
    type: "list",
    message: "What would you like to do?",
    name: "action",
    choices: [
        "View all employees details",
        "Add department",
        "Add employee",
        "Add role",
        "Remove employee",
        "Update employee role",
        "Update employee manager",
        "Delete departments, roles, and employees",
        "View the total utilized budget of a department"
    ]
};

const viewEmployeeQuestion = {
    type: "list",
    message: "View all employees by?",
    name: "viewBy",
    choices: [
        "Department",
        "Manager",
        "Role",
        "View all roles"
    ]
};



function init() {
    prompt(generalQuestion)
        .then((answer) => {
            switch (answer.action) {
                case "View all employees details":
                viewAllEmployeesDetails();
            }
        });
}

async function printAllByDepartment() {
    let query = `
            SELECT * FROM employee 
            LEFT JOIN role 
            ON employee.role_id = role.id LEFT JOIN department
            ON department.id = role.department_id
            WHERE department.name = ?
        `;

    let question = {
        type: "list",
        message: "Which department would you like to view?",
        name: "departmentChoice",
        choices: await getAllDepartments()
    }

    prompt(question).then(({
        departmentChoice
    }) => {
        connection.query(query, [departmentChoice], function (err, res) {
            if (err) throw err;
            console.table(res);
        })
    })
}

function getAllDepartments() {
    return connection.query(`SELECT name FROM department`)
}

function viewAllEmployeesDetails() {
    prompt(viewEmployeeQuestion).then((answer) => {
        switch (answer.viewBy) {
            case "Department":
            printAllByDepartment();
            break;
            // case "Manager":
            // printAllByManager();
            // break; 
            // case "Role":
            // printAllByRole();
            // break; 
            // case "View all roles":
            // printAll();
            // break;    
        }
    })   
}
