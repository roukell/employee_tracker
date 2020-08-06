const inquirer = require("inquirer");
const prompt = inquirer.createPromptModule();
const fs = require("fs");
const mysql = require("mysql");
const cTable = require('console.table');
const util = require("util");
const Choices = require("inquirer/lib/objects/choices");

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
        // "Add department",
        // "Add employee",
        // "Add role",
        // "Remove employee",
        // "Update employee role",
        // "Update employee manager",
        // "Delete departments, roles, and employees",
        // "View the total utilized budget of a department"
        "End application"
    ]
};

const viewEmployeeQuestion = {
    type: "list",
    message: "View all employees by?",
    name: "viewBy",
    choices: [
        "Department",
        "Manager"
        // "Role",
        // "View all roles"
    ]
};

function init() {
    prompt(generalQuestion)
        .then((answer) => {
            switch (answer.action) {
                case "View all employees details":
                    viewAllEmployeesDetails();
                    break;
                case "End application":
                    process.exit();
            }
        });
}

function viewAllEmployeesDetails() {
    prompt(viewEmployeeQuestion).then((answer) => {
        switch (answer.viewBy) {
            case "Department":
                printAllByDepartment();
                break;

                case "Manager":
                printAllByManager();
                break;

                // case "Role":
                // printAllByRole();
                // break; 
                // case "View all roles":
                // printAll();
                // break;    
        }
    })
}

async function printAllByDepartment() {
    let query = `
            SELECT code AS employee_id, first_name, last_name, title, salary, name AS department, manager_id FROM employee 
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

    // console.log(question);

    prompt(question).then(({departmentChoice}) => {
        connection.query(query, [departmentChoice], function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        })
    })
}

async function printAllByManager() {
    let query = `
    SELECT code AS employee_id, first_name, last_name, title, salary, name AS department, manager_id FROM employee

    LEFT JOIN role
    ON employee.role_id = role.id
        
    LEFT JOIN department
    ON department.id = role.department_id
    
    WHERE employee.manager_id = ?
    `;

    let question = {
        type: "list",
        message: "Which manager's team would you like to view? (Select manager id)",
        name: "managerChoice",
        choices: await getAllManagers()
    }

    // console.log(question);

    prompt(question).then(({managerChoice}) => {
        connection.query(query, [managerChoice], function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        })
    })
}

function getAllDepartments() {
    return connection.query(`SELECT name FROM department`)
}

async function getAllManagers() {
    let query = await connection.query(`SELECT distinct manager_id FROM employee WHERE manager_id IS NOT NULL`);
    let newQuery = query.map(obj => {
        let rObj = { name: obj.manager_id}
        // console.log(rObj);
        return rObj
     })
     return newQuery;
}



