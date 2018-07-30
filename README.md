# inteticsTestTask
Intetics Test Task "Antonnikau Artur"

This application it`s a test task. 

Application Goals
- register Androids living among humans
- assign Androids to a suitable job

Application Functionality
1. The Operator of the application is a main user of the application. There can be an
infinite number of Operators. Can be created manually.
- The Operator should be able to login to the application.
2. The Operator can create/read/update/delete (CRUD) Jobs or Androids.
3. Job includes:
- name (Alphanumeric, hyphen | min-length: 2, max-length: 16)
- description (max-length: 255)
- complexity level (for future statistics purposes)
4. Android includes:
- name (Alphanumeric, hyphen | min-length: 5, max-length: 24)
- avatar
- skills (list of tags)
- reliability (default value is 10), decreasing every time when Job is changed.
When reaches 0 change Android status to 0
- status (1 or 0, 0 means Android should be reclaimed)
5. Operator should have an ability to CRUD Android and Job via user interface
6. Operator should have an ability to assign Android to Job.
7. On the Job page there should be a list of assigned Androids.

About installation
1. Clone a GIT ripository: git clone https://github.com/arturantonnikau/inteticsTestTask.git
2. Create a DATABASE name(mydb): CREATE DATABASE mydb;
3. Install a backup mydbdump.sql: 
  3.1 Open CMD(ADMIN) in MYSQL folder: bin>
  3.2 connect mydb database with dump(mydbdump.sql): mysql –u[user name] -p[password] -h[hostname] [mydb] < C:\[localpath]\mydbdump.sql
4. Install bash file install.sh: Open a bash in local directory and write "sh install.sh"
5. Open a command line and type "node app.js"
6. Type in browser 127.0.0.1:8080
