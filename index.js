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

// Add a department, role and/or employee function
addValue = () => {
    // array variables to store data pulled from database for use in questions
    let listOfDepartments = [];
    let listOfRoles = [];
    let listOfManagers = [];
    // asks user what they would like to add
    inquirer
      .prompt({
        name: "add",
        type: "list",
        message: "Which would you like to add?",
        choices: ["Department", "Role", "Employee"],
      })
      .then((val) => {
        // if department selected
        if (val.add === "Department") {
          inquirer
            .prompt({
              type: "input",
              name: "dept_add",
              message:
                "What is the name of the department you would like to add?",
              validate: newDeptInput => {
                if (newDeptInput) {
                  return true
                } else {
                  console.log("Please enter a name for the new department");
                  return false
                }
              }
            })
            .then((answer) => {
              console.log(' ');
              console.log(chalk.green.bold(`====================================================================================`));
              console.log(`                     ` + chalk.red.bold(`Department Added:`) + ` ${answer.dept_add}`);
              console.log(chalk.green.bold(`====================================================================================`));
              console.log(' ');
              connection.query("INSERT INTO Departments SET ?", {name: answer.dept_add}, (err, res) => {
                  if (err) throw err;
                  initialQuery();
                }
              );
            });
  
  
          // if Role is selected
        } else if (val.add === "Role") {
          connection.query(`SELECT * FROM departments`, (err, res) => {
            if (err) throw err;
            listOfDepartments = res.map(dept => (
              {
                name: dept.name,
                value: dept.dept_id
              }
            ))
            inquirer
            .prompt([
              {
                type: "input",
                name: "role_add",
                message: "What is the name of the role you would like to add?",
                validate: newRoleInput => {
                  if (newRoleInput) {
                    return true
                  } else {
                    console.log("Please enter a name for the new role");
                    return false
                  }
                }
              },
              {
                type: "number",
                name: "salary",
                message: "What is the salary for the role you would like to add?",
                default: 10000
              },
              {
                type: "list",
                name: "deptId",
                message: "What is the department for the role you would like to add?",
                choices: listOfDepartments
              }
            ])
            .then((answer) => {
              console.log(' ');
              console.log(chalk.green.bold(`====================================================================================`));
              console.log(`                     ` + chalk.red.bold(`Role Added:`) + ` ${answer.role_add} with a salary of ${answer.salary}`);
              console.log(chalk.green.bold(`====================================================================================`));
              console.log(' ');
              connection.query("INSERT INTO Roles SET ?",
                {
                  title: answer.role_add,
                  salary: answer.salary,
                  dept_id: answer.deptId,
                },
                (err, res) => {
                  if (err) throw err;
                  initialQuery();
                }
              );
            });
          })
  
  
        // If Employee selected
        } else if (val.add === "Employee") {
  
          connection.query(`SELECT * FROM roles`, (err,res) => {
            if (err) throw err;
            listOfRoles = res.map(role => (
              {
                name: role.title,
                value: role.role_id
              }
            ));            
            inquirer
              .prompt([                
                {
                  type: "input",
                  name: "empAddFirstName",
                  message:
                    "What is the first name of the employee you would like to add?",
                  validate: firstNameInput => {
                    if (firstNameInput) {
                      return true
                    } else {
                      console.log ("Please enter a first name");
                      return false
                    }
                  }
                },
                {
                  type: "input",
                  name: "empAddLastName",
                  message:
                    "What is the last name of the employee you would like to add?",
                },
                {
                  type: "list",
                  name: "roleId",
                  message: "What is the role of the employee you would like to add?",
                  choices: listOfRoles
                },
                {
                  type: "number",
                  name: "empAddMgrId",
                  message:
                    "What is the manager ID of the employee you would like to add?",
                  default: 1,
                },
              ])
              .then((answer) => {
                console.log(' ');
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(`                     ` + chalk.red.bold(`Employee Added:`) + ` ${answer.empAddFirstName} ${answer.empAddLastName}`);
                console.log(chalk.green.bold(`====================================================================================`));
                console.log(' ');
                connection.query("INSERT INTO Employees SET ?",
                  {
                    last_name: answer.empAddLastName,
                    first_name: answer.empAddFirstName,
                    role_id: answer.roleId,
                    manager_id: answer.empAddMgrId,
                  },
                  (err, res) => {
                    if (err) throw err;
                    initialQuery();
                  }
                );
              });
            })
        }
      });
}






//view budget function for the departments
viewBudget = () => {
    const query = `SELECT departments.dept_id AS Dept_ID, departments.name as Department_Name, CONCAT('$', FORMAT(SUM(salary),0)) AS Budget
    FROM roles
    INNER JOIN employees USING (role_id)
    INNER JOIN departments ON roles.dept_id = departments.dept_id
    GROUP BY roles.dept_id;`;
    connection.query(query,(err,res)=>{
        if (err) throw err;
        console.log(` `);
        console.log(chalk.green.bold(`====================================================================================`));
        console.log(`                              ` + chalk.red.bold(`Department Budgets:`));
        console.table(res);
        console.log(chalk.green.bold(`====================================================================================`));
        console.log(` `);
        initialQuery();
    })
}
