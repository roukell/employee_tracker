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
        "Update information",
        // "Delete information",
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
    name: "addNew",
    choices: [
        "Add a new department",
        "Add a new employee",
        "Add a new role"
    ]
};

const updateInfoQuestion = {
    type: "list",
    message: "What information would you like to update?",
    name: "update",
    choices: [
        "Update employee's role",
        "Update employee's manager",
    ]
};

const exitQuestion = {
    type: "list",
    message: "Would you like to do now?",
    name: "action",
    choices: [
        "View results",
        "Edit more details",
        "End application"
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
                case "Add new information":
                    addNewInfo();
                    break;
                case "Update information":
                    updateInfo();
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

function addNewInfo() {
    prompt(addInfoQuestion).then((answer) => {
        switch (answer.addNew) {
            case "Add a new department":
                addNewDepartment();
                break;

                case "Add a new employee":
                addNewEmployee();
                break;

                case "Add a new role":
                addNewRole();
                break;    
        }
    })
}

function updateInfo() {
    prompt(updateInfoQuestion).then((answer) => {
        switch (answer.update) {
            case "Update employee's role":
                updateEmployeeRole();
                break;

                case "Update employee's manager":
                updateEmployeeManager();
                break;  
        }
    })
}

async function printAllByDepartment() {
    let query = `
            SELECT employee.id, first_name, last_name, title, salary, name AS department, manager_id FROM employee 
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

    prompt(question).then(({
        departmentChoice
    }) => {
        connection.query(query, [departmentChoice], function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        })
    })
}

async function printAllByManager() {
    let query = `
    SELECT employee.id, first_name, last_name, title, salary, name AS department, manager_id FROM employee

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

    prompt(question).then(({
        managerChoice
    }) => {
        connection.query(query, [managerChoice], function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        })
    })
}

async function printAllByRole() {
    let query = `
            SELECT employee.id, first_name, last_name, title, salary, name AS department, manager_id FROM employee 
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

    prompt(question).then(({
        roleChoice
    }) => {
        connection.query(query, [roleChoice], function (err, res) {
            if (err) throw err;
            console.table(res);
            init();
        })
    })
}

async function printAll() {
    let query = `
            SELECT employee.id, first_name, last_name, title, salary, name AS department, manager_id FROM employee 
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
        let rObj = {
            name: obj.manager_id
        }
        console.log(rObj);
        return rObj
    })
    return newQuery;
}

async function getAllRoles() {
    let query = await connection.query(`SELECT id, title FROM role`);
    let newQuery = query.map(obj => {
        let rObj = {
            id: obj.id,
            name: obj.title
        }
        // console.log(rObj);
        return rObj
    })
    return newQuery;
}

function viewAllDepartments() {
    connection.query((`SELECT * FROM department`), (err, res) => {
        if (err) throw err;
        console.table(res);
        process.exit();
    })
}

function viewAllRoles() {
    connection.query((`SELECT * FROM role`), (err, res) => {
        if (err) throw err;
        console.table(res);
        process.exit();
    })
}

function addNewDepartment() {
    const question = [{
            type: "input",
            message: "What is your new department ID? (Do not use the same ID)",
            name: "id"
        },
        {
            type: "input",
            message: "What is your new department name?",
            name: "name"
        }
    ];

    prompt(question).then((answer) => {
        connection.query('INSERT INTO department (id, name) VALUES (?, ?)', [answer.id, answer.name], (err, result) => {
            if (err) throw err;
            console.log("Success!");

            prompt(exitQuestion).then((answer) => {
                switch (answer.action) {
                    case "View results":
                        viewAllDepartments();
                        break;

                    case "Edit more details":
                        init();
                        break;

                    case "End application":
                        process.exit();
                }
            })
        })
    })
}

function addNewEmployee() {
    const question = [{
        type: "input",
        message: "What is your new employee ID? (Do not use the same ID)",
        name: "id"
    },
    {
        type: "input",
        message: "What is your new employee's first name?",
        name: "first_name"
    },
    {
        type: "input",
        message: "What is your new employee's last name?",
        name: "last_name"
    },
    {
        type: "input",
        message: "What is your new employee's role ID?",
        name: "role_id"
    },
    {
        type: "input",
        message: "What is your new employee manager ID? (If no manager, enter: Null)",
        name: "manager_id"
    }
];

prompt(question).then((answer) => {
    connection.query('INSERT INTO employee (id, first_name, last_name, role_id, manager_id) VALUES (?, ?, ?, ?, ?);', 
    [answer.id, answer.first_name, answer.last_name, answer.role_id, answer.manager_id], 
    (err, result) => {
        if (err) throw err;
        console.log("Success!");
        exitOptionPrintAll();
    })
})
}

function addNewRole() {
    const question = [{
        type: "input",
        message: "What is the ID for this role? (Do not use the same ID)",
        name: "id"
    },
    {
        type: "input",
        message: "What is its title?",
        name: "title"
    },
    {
        type: "input",
        message: "Enter the salary of the role",
        name: "salary"
    },
    {
        type: "input",
        message: "What is the department ID for this role?",
        name: "department_id"
    }
];

prompt(question).then((answer) => {
    connection.query('INSERT INTO role (id, title, salary, department_id) VALUES (?, ?, ?, ?);', [answer.id, answer.title, answer.salary, answer.department_id], (err, result) => {
        if (err) throw err;
        console.log("Success!");

        prompt(exitQuestion).then((answer) => {
            switch (answer.action) {
                case "View results":
                    viewAllRoles();
                    break;

                case "Edit more details":
                    init();
                    break;

                case "End application":
                    process.exit();
            }
        })
    })
})
}

function updateEmployeeRole() {
    const question = [{
        type: "input",
        message: "Which employee's role would you like to change? Please enter employee's ID",
        name: "id"
    },
    {
        type: "input",
        message: "Which role would you like to change this person to? Please enter role ID.",
        name: "roleId"
    }
];

prompt(question).then((answer) => {
    connection.query('UPDATE employee SET role_id = ? WHERE id = ?', [answer.roleId, answer.id], (err, result) => {
        if (err) throw err;
        console.log("Success!");
        exitOptionPrintAll();
    })
})
}

function updateEmployeeManager() {
    const question = [{
        type: "input",
        message: "Which employee's manager would you like to change? Please enter employee's ID",
        name: "id"
    },
    {
        type: "input",
        message: "Please enter the employee's new manager (enter manager id, if no manager enter: Null)",
        name: "managerId"
    }
];

prompt(question).then((answer) => {
    connection.query('UPDATE employee SET manager_id = ? WHERE id = ?', [answer.managerId, answer.id], (err, result) => {
        if (err) throw err;
        console.log("Success!");
        exitOptionPrintAll();
    })
})
}

function exitOptionPrintAll() {
    prompt(exitQuestion).then((answer) => {
        switch (answer.action) {
            case "View results":
                printAll();
                break;

            case "Edit more details":
                init();
                break;

            case "End application":
                process.exit();
        }
    })
}