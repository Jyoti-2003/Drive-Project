# Drive Project

A simple file storage web application. Users can **upload**, **download** and **delete** files through a web interface.

## About the Project

Drive Project has two parts:

- **Backend**: a Spring Boot REST API that stores files and handles upload, download and delete requests.
- **Frontend**: a web app where users pick files, see the uploaded list, and download or delete them.

I built this project to learn how a full-stack application works: creating REST APIs, handling file uploads on the server, and connecting a frontend to a backend.

## Features

- **Upload** a file from your computer
- **Download** any uploaded file
- **Delete** files you no longer need
- View the list of uploaded files

## Tech Stack

| Part       | Technology                             |
|------------|----------------------------------------|
| Backend    | Java 17+, Spring Boot, Maven           |
| Frontend   | React, JavaScript, HTML, CSS           |
| Version control | Git and GitHub                    |

## How It Works

```
Browser (Frontend)  --->  Spring Boot API (Backend)  --->  File storage
```

1. The user uploads, downloads or deletes a file in the frontend.
2. The frontend sends an HTTP request to the Spring Boot API.
3. The backend saves, returns or removes the file and sends back a response.
4. The frontend updates the file list.

## Project Structure

```
Drive-Project/
├── Drive-Backend/                  # Spring Boot API
│   ├── src/main/java/com/jyoti/Drive/Backend/
│   ├── src/main/resources/application.properties
│   └── pom.xml
├── drive-frontend 2/
│   └── drive-frontend/             # Frontend app
└── README.md
```

## Prerequisites

- JDK 17 or higher
- Node.js 18+ and npm
- Git

## How to Run

### 1. Clone the repository

```bash
git clone https://github.com/Jyoti-2003/Drive-Project.git
cd Drive-Project
```

### 2. Start the backend

```bat
cd Drive-Backend
mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`.

### 3. Start the frontend

```bash
cd "drive-frontend 2/drive-frontend"
npm install
npm start
```

The app opens at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint             | Description            |
|--------|----------------------|------------------------|
| POST   | `/api/files/upload`  | Upload a file          |
| GET    | `/api/files`         | List all files         |
| GET    | `/api/files/{id}`    | Download a file        |
| DELETE | `/api/files/{id}`    | Delete a file          |

> Replace these with your actual endpoint paths.

## What I Learned

- Building REST APIs with Spring Boot
- Handling file uploads and downloads on the server
- Connecting a React frontend to a backend API
- Using Git and GitHub to manage a project

## Future Improvements

- User login and authentication
- Folders to organize files
- File sharing
- File size limits and type validation

## Author

**Jyoti**
GitHub: [Jyoti-2003](https://github.com/Jyoti-2003)
