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

const generalQuestion = {
    type: "list",
    message: "What would you like to do?",
    name: "action",
    choices: [
        "View employee details",
        "Add new information",
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
        "Manager",
        "Role",
        "View all employees"
    ]
};

const addInfoQuestion = {
    type: "list",
    message: "What information would you like to add?",
    name: "addNewDetails",
    choices: [
        "Add a new department",
        "Add a new employee",
        "Add a new role"
    ]
};

connection.query = util.promisify(connection.query);

connection.connect(err => {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    init();
});

function init() {
    prompt(generalQuestion)
        .then((answer) => {
            switch (answer.action) {
                case "View employee details":
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

                case "Role":
                printAllByRole();
                break; 

                case "View all employees":
                printAll();
                break;    
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

async function printAllByRole() {
    let query = `
            SELECT code AS employee_id, first_name, last_name, title, salary, name AS department, manager_id FROM employee 
            LEFT JOIN role 
            ON employee.role_id = role.id LEFT JOIN department
            ON department.id = role.department_id
            WHERE role.title = ?
        `;

    let question = {
        type: "list",
        message: "Which role would you like to view?",
        name: "roleChoice",
        choices: await getAllRoles()
    }

    // console.log(question);

    prompt(question).then(({roleChoice}) => {
        connection.query(query, [roleChoice], function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        })
    })
}

async function printAll() {
    let query = `
            SELECT code AS employee_id, first_name, last_name, title, salary, name AS department, manager_id FROM employee 
            LEFT JOIN role 
            ON employee.role_id = role.id LEFT JOIN department
            ON department.id = role.department_id
        `;

        await connection.query(query, function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
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

async function getAllRoles() {
    let query = await connection.query(`SELECT title FROM role`);
    let newQuery = query.map(obj => {
        let rObj = { name: obj.title}
        // console.log(rObj);
        return rObj
     })
     return newQuery;
}



