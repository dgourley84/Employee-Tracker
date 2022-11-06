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
                "Update employee manager",
                "Remove employee",
                "Remove role",
                "Remove department",
                "View department budgets",
                "View employees by manager",
                "View employees by department",
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
                
              case "Update employee manager":
                updateManager();
                break;
      
              case "Remove employee":
                removeEmp();
                break;
                
              case "Remove role":
                removeRole();
                break;

              case "Remove department":
                removeDept();
                break;
              
              case "View department budgets":
                viewBudget();
                break;

              case "View employees by manager":
                viewEmployeeMgr();
                break;

              case "View employees by department":
                viewEmployeeDept();
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
                const query = `SELECT employees.emp_id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department, 
                e2.first_name AS manager FROM employees LEFT JOIN employees as e2 ON e2.emp_id = employees.manager_id 
                JOIN roles ON employees.role_id = roles.role_id 
                JOIN departments ON roles.dept_id = departments.dept_id                    
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


//View employees by department
viewEmployeeDept = () => {
 // Query the database for all available departments to prompt user
 connection.query("SELECT * FROM departments", function (err, results) {
  if (err) throw err;
  inquirer
      .prompt([
          {
              name: "department",
              type: "list",
              choices: function () {
                  let choiceArray = [];
                  for (var i = 0; i < results.length; i++) {
                      choiceArray.push(results[i].name);
                  }
                  return choiceArray;
              },
              message: "What department would you like to search by?"
          }
      ])
      .then(function (answer) {
          console.log(answer.department);
          let query = 'SELECT employees.emp_id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department, e2.first_name AS manager FROM employees LEFT JOIN employees as e2 ON e2.emp_id = employees.manager_id JOIN roles ON employees.role_id = roles.role_id JOIN departments ON roles.dept_id = departments.dept_id WHERE departments.name = ? ORDER BY employees.emp_id'
          connection.query(query, answer.department, function (err, res) {
              if (err) throw err;
              console.log(' ');
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(`                              ` + chalk.red.bold(`View by departments:`));
                    console.table(res);
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(' ');
                    initialQuery();
          });
      });
});
};   

//View employees by manager
viewEmployeeMgr = () => {
  connection.query("SELECT DISTINCT e2.first_name, e2.last_name FROM employees LEFT JOIN employees AS e2 ON employees.manager_id = e2.emp_id WHERE e2.first_name IS NOT NULL", function (err, results) {
  if (err) throw err;
  inquirer
      .prompt([
          {
              name: "manager",
              type: "list",
              choices: function () {
                  let choiceArray = [];
                  for (var i = 0; i < results.length; i++) {
                      choiceArray.push(results[i].first_name);
                  }
                  return choiceArray;
              },
              message: "Which manager would you like to search by?"
          }
      ])
      .then(function (answer) {
          console.log(answer.manager);
          let query = 'SELECT employees.emp_id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department, e2.first_name AS manager FROM employees LEFT JOIN employees AS e2 ON e2.emp_id = employees.manager_id JOIN roles ON employees.role_id = roles.role_id JOIN departments ON roles.dept_id = departments.dept_id WHERE e2.first_name = ? ORDER BY employees.emp_id;'
          connection.query(query, answer.manager, function (err, res) {
              if (err) throw err;
              console.log(' ');
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(`                              ` + chalk.red.bold(`View by managers:`));
                    console.table(res);
                    console.log(chalk.green.bold(`====================================================================================`));
                    console.log(' ');
                    initialQuery();
          });
      });
});
  
}

//remove employee
removeEmp = () => {
    connection.query("SELECT * FROM employees", function (err, results) {
      if (err) throw err;
      inquirer
          .prompt([
              {
                  name: "removeEmployee",
                  type: "list",
                  choices: function () {
                      let choiceArray = [];
                      for (var i = 0; i < results.length; i++) {
                          choiceArray.push(results[i].first_name);
                      }
                      return choiceArray;
                  },
                  message: "Which employee would you like to remove?"
              }
          ])
          .then(function (answer) {
              let query = 'DELETE FROM employees WHERE first_name = ?;'
              connection.query(query, answer.removeEmployee, function (err, res) {
                  if (err) throw err;
                  console.log("Employee successfully deleted");
                  initialQuery();
              });
          });
  });
}

//remove role
removeRole = () => {
  connection.query("SELECT * FROM roles", function (err, results) {
    if (err) throw err;
    inquirer
        .prompt([
            {
                name: "removeRole",
                type: "list",
                choices: function () {
                    let choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].title);
                    }
                    return choiceArray;
                },
                message: "Which role would you like to remove?"
            }
        ])
        .then(function (answer) {
            let query = 'DELETE FROM roles WHERE title = ?;'
            connection.query(query, answer.removeRole, function (err, res) {
                if (err) throw err;
                console.log("Role successfully deleted");
                initialQuery();
            });
        });
});
}

//remove department
removeDept = () => {
  connection.query("SELECT * FROM departments", function (err, results) {
    if (err) throw err;
    inquirer
        .prompt([
            {
                name: "removeDept",
                type: "list",
                choices: function () {
                    let choiceArray = [];
                    for (var i = 0; i < results.length; i++) {
                        choiceArray.push(results[i].name);
                    }
                    return choiceArray;
                },
                message: "Which department would you like to remove?"
            }
        ])
        .then(function (answer) {
            let query = 'DELETE FROM departments WHERE name = ?;'
            connection.query(query, answer.removeDept, function (err, res) {
                if (err) throw err;
                console.log("Department successfully deleted");
                cb();
            });
        });
});
}

//update role of employee
updateRole = () => {
  let newRole = {};

  connection.query("SELECT employees.emp_id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department, e2.first_name AS manager FROM employees LEFT JOIN employees AS e2 ON e2.emp_id = employees.manager_id JOIN roles ON employees.role_id = roles.role_id JOIN departments ON roles.dept_id = departments.dept_id ORDER BY employees.emp_id", 
  function (err, results) {
      if (err) throw err;
      inquirer
          .prompt([
              {
                  name: "updateEmployee",
                  type: "list",
                  choices: function () {
                      let choiceArray = [];
                      for (var i = 0; i < results.length; i++) {
                          choiceArray.push(results[i].first_name);
                      }
                      return choiceArray;
                  },
                  message: "Which employee would you like to update?"
              }
          ])
          .then(function (answer) {

              newRole.first_name = answer.updateEmployee;

              connection.query("SELECT * FROM roles", function (err, res) {
                  if (err) throw err;
                  inquirer
                      .prompt([
                          {
                              name: "updateRole",
                              type: "list",
                              choices: function () {
                                  let choiceArray = [];
                                  for (var i = 0; i < results.length; i++) {
                                      choiceArray.push(results[i].title);
                                  }
                                  return choiceArray;
                              },
                              message: "What would you like you to change their role title to?"
                          }
                      ])
                      .then(function (answer) {
                          // Translate role to role_id
                          connection.query("SELECT * FROM roles WHERE title = ?", answer.updateRole, function (err, results) {
                              if (err) throw err;

                              newRole.role_id = results[0].role_id;

                              connection.query("UPDATE employees SET role_id = ? WHERE first_name = ?", [newRole.role_id, newRole.first_name], function (err, res) {
                                  if (err) throw (err);
                                  console.log('Employee role successfully updated.');
                                  initialQuery();
                              })

                          })
                      });
              });
          });
  })
}

//update manager of employee
updateManager = () => {
  let newManager = {};

    connection.query("SELECT employees.emp_id, employees.first_name, employees.last_name, roles.title, roles.salary, departments.name AS department, e2.first_name AS manager FROM employees LEFT JOIN employees AS e2 ON e2.emp_id = employees.manager_id JOIN roles ON employees.role_id = roles.role_id JOIN departments ON roles.dept_id = departments.dept_id ORDER BY employees.emp_id",
    function (err, results) {
        if (err) throw err;
        inquirer
            .prompt([
                {
                    name: "updateEmployee",
                    type: "list",
                    choices: function () {
                        let choiceArray = [];
                        for (var i = 0; i < results.length; i++) {
                            choiceArray.push(results[i].first_name);
                        }
                        return choiceArray;
                    },
                    message: "Which employee would you like to update?"
                }
            ])
            .then(function (answer) {

                newManager.first_name = answer.updateEmployee;

                connection.query("SELECT * FROM employees", function (err, res) {
                    if (err) throw err;
                    inquirer
                        .prompt([
                            {
                                name: "updateManager",
                                type: "list",
                                choices: function () {
                                    let choiceArray = [];
                                    for (var i = 0; i < results.length; i++) {
                                        choiceArray.push(results[i].first_name);
                                    }
                                    return choiceArray;
                                },
                                message: "Who would you like to change their manager to?"
                            }
                        ])
                        .then(function (answer) {
                            connection.query("SELECT * FROM employees WHERE first_name = ?", answer.updateManager, function (err, results) {
                                if (err) throw err;

                                newManager.manager_id = results[0].emp_id;

                                connection.query("UPDATE employees SET manager_id = ? WHERE first_name = ?", [newManager.manager_id, newManager.first_name], function (err, res) {
                                    if (err) throw (err);
                                    console.log('Employee manager successfully updated.');
                                    initialQuery();
                                })

                            })
                        });
                });
            });
    })

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
