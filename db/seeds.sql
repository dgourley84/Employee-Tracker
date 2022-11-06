INSERT INTO Departments (name)

-- DEPARTMENTS
VALUES ("Executive"), 
("Finance"), 
("Human Resources"), 
("Information Technology"), 
("Operations"), 
("Sales");

-- ROLES
INSERT INTO Roles (title,salary,dept_id)
VALUES 
("Assistant to the Regional Manager", 90000.00, 1),
("Regional Manager", 180000.00, 1),
("Accountant", 70000.00, 2),
("HR Associate", 90000.00, 3),
("Software Engineer", 175000.00, 4),
("Administrative Professional", 40000.00, 5),
("Manager", 80000.00, 6),
("Quality Control Associate", 45000.00, 6),
("Sales Representative", 60000.00, 6);

-- EMPLOYEES
-- Create managers who do not have a manager so that employees with managers have correct manager_id
INSERT INTO Employees (first_name,last_name,role_id, manager_id)
VALUES 
("Michael", "Scott", 2, NULL),
("Angela", "Martin", 3, NULL),
("Darryl", "Philbin", 5, NULL),
("Dallas", "Gourley", 3, NULL);

-- Create employees
INSERT INTO Employees (first_name,last_name,role_id,manager_id)
VALUES 
("Dwight", "Schrute", 1, 1),
("Jim", "Halpert", 9, 1),
("Pam", "Beasley", 6, 1),
("Stanley", "Hudson", 9, 1),
("Phyllis", "Lapin", 9, 1),
("Oscar", "Gutierrez", 3, 2),
("Kevin", "Malone", 3, 2),
("Creed", "Bratton", 6, 3),
("Andy", "Bernard", 7, 1),
("Toby", "Flenderson", 4, 1);