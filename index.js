// npm packages set as variables
const inquirer = require("inquirer");
const figlet = require("figlet");
const chalk = require("chalk");
const cTable = require("console.table");

// modules set as variables
const {connection} = require('./config/connection');

//header function that runs upon starting file
connection.connect((err)=>{
    if(err) throw err;
    console.log(chalk.blue.bold(`==============================================================================================`));
    console.log(chalk.blue.bold(`==============================================================================================`));

    console.log(``);
    //create title using figlet
    console.log(chalk.red.bold(figlet.textSync("Employee Tracker",{
        font: "Star Wars",
        horizontalLayout: "default",
        verticalLayout: "default",
        width: 90,
        whitespaceBreak: false,
    })))
    console.log(`                                                                    ` + chalk.yellow.bold("Created By: Dallas Gourley"));

    console.log(``);
    console.log(chalk.blue.bold(`==============================================================================================`));
    console.log(chalk.blue.bold(`==============================================================================================`));
    console.log(``);
    // calls the initialQuery function that asks the user what they would like to do
    initialQuery();
});

// initial question asks user what they would like to do
initialQuery = () => {
    inquirer
        .prompt({
            name: "action",
            type: "rawlist",
            message: "What would you like to do?",
            choices:[
                "View department, roles or employees",
                "Add department, roles or employees",
                "Update employee role",
                "Remove employee",
                "View department budgets",
                "Exit",
            ],
        })
        .then((answer) => {
            switch (answer.action) {
              case "View department, roles or employees":
                viewTable();
                break;
      
              case "Add department, roles or employees":
                addValue();
                break;
      
              case "Update employee role":
                updateRole();
                break;
      
              case "Remove employee":
                  removeEmp();
                  break;
      
              case "View department budgets":
                  viewBudget();
                  break;
      
              case "Exit":
                connection.end();
                break;
            }
          });
}

//function to view tables of departments, roles and/or employees
viewTable = () => {
    inquirer
        .prompt({
            name: "view_table",
            type: "list",
            message: "Which table would you like to view?",
            choices: ["Departments", "Roles", "Employees"],
        })
        .then((val) => {
            if(val.view_table === "Departments"){
                connection.query(`SELECT dept_id AS Department_ID, departments.name AS Department_Name FROM departments`,(err,res)=> {
                    if (err) throw err;
                    console.log(' ');
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(`                              ` + chalk.red.bold(`All Departments:`));
                    console.table(res);
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(' ');
                    initialQuery();                    
                });
            } else if (val.view_table === "Roles"){
                const query = `SELECT roles.role_id AS Role_ID, roles.title AS Title, CONCAT('$',format(salary,0)) as Salary, departments.name AS department
                FROM roles
                INNER JOIN departments ON roles.dept_id = departments.dept_id
                ORDER by roles.role_id ASC`
                connection.query(query,(err,res)=> {
                    if(err) throw err;
                    console.log(' ');
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(`                              ` + chalk.red.bold(`All Roles:`));
                    console.table(res);
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(' ');
                    initialQuery();
                });
            } else if (val.view_table === "Employees"){
                const query = `SELECT emp_id AS Employee_ID, first_name AS First_Name, last_name AS Last_Name, title AS Title, CONCAT('$',FORMAT(salary,0)) AS Salary, departments.name AS Department
                FROM employees
                INNER JOIN roles ON employees.role_Id = roles.role_id
                INNER JOIN departments ON roles.dept_id = departments.dept_id
                ORDER BY last_name ASC`
                connection.query(query, (err,res)=>{
                    if (err) throw err;
                    console.log(' ');
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(`                              ` + chalk.red.bold(`All Employees:`));
                    console.table(res);
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(' ');
                    initialQuery();
                });
            }
        });
}