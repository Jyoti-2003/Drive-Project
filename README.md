# Drive Project

A full-stack cloud storage application inspired by Google Drive. Users can create an account, upload files, organize them into folders, and access them from any browser.

## About the Project

Drive Project lets users store and manage their files online. The **backend** is a Spring Boot REST API that handles authentication, file storage and database operations. The **frontend** is a web app that gives users a clean interface to interact with the API.

I built this project to learn how a real-world full-stack application works: designing REST APIs, connecting a database, handling file uploads, and linking a frontend to a backend.

## Features

- **User authentication**: register and log in securely
- **File upload and download**: store files and retrieve them anytime
- **Folder management**: create, rename and delete folders
- **File organization**: move files into folders
- **Delete files**: remove files you no longer need
- **REST API**: JSON-based endpoints that any client can use
- **Responsive UI**: works on desktop and mobile browsers

## Tech Stack

| Part           | Technology                                   |
|----------------|----------------------------------------------|
| Backend        | Java 17+, Spring Boot, Spring Data JPA       |
| Build tool     | Maven (Maven Wrapper included)               |
| Database       | MySQL                                        |
| Frontend       | React, JavaScript, HTML, CSS                 |
| Version control| Git and GitHub                               |

## How It Works

```
Browser (Frontend)  --->  Spring Boot API (Backend)  --->  MySQL Database
   React UI               REST endpoints                    users, files,
                          business logic                    folders
```

1. The user interacts with the React frontend.
2. The frontend sends HTTP requests to the Spring Boot API.
3. The backend validates the request, processes it, and reads or writes data in MySQL.
4. The backend sends a JSON response, and the frontend updates the screen.

## Project Structure

```
Drive-Project/
├── Drive-Backend/
│   ├── src/main/java/com/jyoti/Drive/Backend/
│   │   ├── controller/      # API endpoints
│   │   ├── service/         # Business logic
│   │   ├── repository/      # Database access
│   │   └── model/           # Entities
│   ├── src/main/resources/
│   │   └── application.properties
│   └── pom.xml
├── drive-frontend 2/
│   └── drive-frontend/      # React application
└── README.md
```
