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

// connection.query(query, (result)=>{console.log(result)});
// connection.query(query).then((result)=>{console.log(result)});

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
        "Add department",
        "Add employee",
        "Remove employee",
        "Update employee role",
        "Update employee manager",
        "View all roles"
    ]
}];

// const departmentQuestion = [{
//     type: "list",
//     message: "Which department would you like to view?",
//     name: "departmentChoice",
//     choices: [
//         "Managment",
//         "Engineering",
//         "Development",
//         "Marketing"
//     ]
// }];

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