

# School Management System API



A complete School Management System Backend built with Node.js, Express.js, MongoDB, and JWT Authentication.



The system provides management for:



- Administrators

- Teachers

- Students

- Classes

- Subjects

- Attendance

- Exams

- Analytics



---



## Features



### Authentication



- Admin Authentication

- Teacher Authentication

- Student Authentication

- JWT Access Token Authorization

- Protected Routes

- Role-Based Access Control



---



### Admin Management



- Create Admin

- Login Admin

- Update Admin Profile

- Delete Admin



---



### Teacher Management



- Create Teacher

- View Teachers

- Update Teacher

- Delete Teacher

- Activate / Deactivate Teacher



---



### Student Management



- Create Student

- View Students

- Update Student

- Delete Student

- Activate / Deactivate Student



---



### Class Management



- Create Class

- Assign Students

- Assign Teachers

- View Classes

- Update Classes

- Delete Classes



---



### Subject Management



- Create Subject

- Assign Subject To Teacher

- View Subjects

- Update Subjects

- Delete Subjects



---



### Attendance Management



- Create Attendance

- Update Attendance

- View Attendance

- Student Attendance Tracking

- Attendance Analytics



---



### Examination Management



- Create Exams

- Upload Results

- View Results

- Student Performance Tracking

- Class Performance Tracking



---



### Analytics



#### Admin Analytics



- Students Per Class

- Attendance Overview

- Class Performance Overview

- Top Students Attendance



#### Teacher Analytics



- Academic Analytics

- Attendance Overview

- Class Performance Overview

- Top Students Attendance



#### Student Analytics



- Personal Attendance Analytics

- Personal Academic Analytics



---



## Tech Stack



### Backend



- Node.js

- Express.js

- MongoDB

- Mongoose

- JWT

- Bcrypt

- Express Async Handler



---



## Project Structure



```text

src/

│

├── controllers/

├── models/

├── routes/

├── middleware/

├── utils/

├── config/

└── server.js

````



---



## Installation



### Clone Repository



```bash

git clone https://github.com/yourusername/school-management-backend.git

```



### Install Dependencies



```bash

npm install

```



### Configure Environment Variables



Create a `.env` file:



```env

PORT=5000



MONGO_URI=your_mongodb_connection



JWT_SECRET=your_secret_key

```



### Start Development Server



```bash

npm run dev

```



Server:



```bash

http://localhost:5000

```



---



## API Base URL



```http

http://localhost:5000/api

```



---



## Authentication



All protected routes require:



```http

Authorization: Bearer <token>

```



---



## Status



Current Version: MVP



Completed Modules:



* Authentication

* Teacher Management

* Student Management

* Class Management

* Subject Management

* Attendance Management

* Examination Management

* Analytics



Remaining:



* Finance Module

* File Upload Module

* Deployment

* Frontend Integration



---



## Author



Abdijabaar Said Abdi



Bachelor of Computer Science



Full Stack Developer




