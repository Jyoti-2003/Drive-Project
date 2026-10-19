package com.jyoti.Drive.Backend.Controller;

import com.jyoti.Drive.Backend.Entity.FileEntity;
import com.jyoti.Drive.Backend.Service.FileServiceStorage;
import org.aspectj.weaver.ast.Not;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

// REST controller: handles HTTP requests and returns data (JSON) instead of views
@RestController
// All endpoints in this class start with /api/files
@RequestMapping("/api/files")
// Allows the React frontend running on localhost:3000 to call this API
@CrossOrigin(origins = "http://localhost:3000")
public class FileController {

    // Service that contains the file storage logic (save, get, delete files)
    private final FileServiceStorage fileServiceStorage;

    // Constructor: Spring automatically gives us the FileServiceStorage object (dependency injection)
    public FileController(FileServiceStorage fileServiceStorage) {
        // Store the service so we can use it in the controller methods
        this.fileServiceStorage = fileServiceStorage;
    }




    // Handles POST requests to /api/files (used to upload a file)
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFiles(
            // The uploaded file sent from the frontend with the key "file". According to the key the file should be taken
            @RequestParam("file")MultipartFile file,
            // Optional folder ID where the file should be saved (can be null for root)
            @RequestParam(value = "parentFolderId",required =false) Long parentFolderId){
        // Try to save the file
        try{
            // Call the service to save the file and get a result message
            String response=fileServiceStorage.saveFile(file,parentFolderId);
            // Send the result back with HTTP status 200 (OK)
            return ResponseEntity.ok(response);
        }
        // If anything goes wrong while saving
        catch(Exception e)
        {
            // Send HTTP status 500 (server error) with a failure message
            return ResponseEntity.status(500).body("File uploaded failed! 🤞");
        }
    }




    // Handles GET requests to /api/files/download/{id} (used to download a file)
    @GetMapping("/download/{id}")
    // Resource is Java's way of representing any kind of file (pdf, ppt, txt, etc.)
    public ResponseEntity<Resource> downloadFile(@PathVariable Long id){
        // Try to find and return the file
        try{
            // Get the file's details (name, path) from the MySQL database like meta data of file, not the actual file
            FileEntity fileEntity=fileServiceStorage.getFileById(id);
            // Build a path object from the file location saved in the database
            Path path= Paths.get(fileEntity.getPath());
            // Load the actual file from that path so it can be sent in the response
            Resource resource=new UrlResource(path.toUri());
            // Send HTTP status 200 (OK)
            return ResponseEntity.ok()
                    // Tell the browser (Chrome) to download this file instead of opening it, using its original name
                    .header("content-Disposition","attachment; filename=\""+fileEntity.getName() +"\"")
                    // Put the file content in the response body
                    .body(resource);
        }
        // If anything goes wrong (file not found in DB or on disk)
        catch(Exception e)
        {
            // Send HTTP status 404 (Not Found) with nobody
            return ResponseEntity.status(404).build();
        }
    }


//---------------------------------------------------------------------------------------------------------------------

    // This endpoint runs when the frontend calls GET /list
    // It's what shows the files and folders when you open the drive
    @GetMapping("/list")
    public ResponseEntity<List<FileEntity>> listFiles(
            // Optional query parameter, e.g. /list?parentFolderId=5
            // If it's not sent, we treat it as the root (top-level) of the drive
            @RequestParam(value = "parentFolderId", required = false) Long parentFolderId) {

        // This list will hold the files/folders we want to show
        List<FileEntity> files;

        if (parentFolderId == null) {
            // No folder given -> show the top-level (root) files and folders
            files = fileServiceStorage.getFilesInFolder(null);
        } else {
            // A folder id was given -> show what's inside that folder
            files = fileServiceStorage.getFilesInFolder(parentFolderId);
        }

        // Send the list back to the client with HTTP status 200 (OK)
        return ResponseEntity.ok(files);
    }




    // This endpoint runs when the frontend calls DELETE /delete/5 (5 = the file's id)
    @DeleteMapping("/delete/{id}")
    //    ResponseEntity<String> is a box that holds everything you send back to someone who made a request to your Java web app.
    //
    //    The box has three parts:
    //    Status: did it work? (200 OK, 404 Not Found, etc.)
    //    Headers: extra info about the response
    //    Body: the actual content, here a piece of text (String)
    public ResponseEntity<String> deleteFile(
            // Takes the id from the URL itself, e.g. /delete/5 -> id = 5
            @PathVariable Long id) {
        try {
            // Step 1: Ask the database (MySQL) for this file's details.
            // This is only the metadata (name, path, etc.), not the actual file.
            FileEntity fileEntity = fileServiceStorage.getFileById(id);

            // Step 2: Build a Path object from the location saved in the database,
            // then delete the real file from the disk (if it exists).
            Path path = Paths.get(fileEntity.getPath());
            Files.deleteIfExists(path);

            // Step 3: Now remove the file's record (metadata) from the database too,
            // so the drive no longer lists it.
            fileServiceStorage.deleteById(id);

            // Everything worked -> send back HTTP 200 (OK) with a success message
            return ResponseEntity.ok("file deleted successfully! 😁😁😁");
        }
        catch (Exception e) {
            // If anything fails (file not found in DB, disk error, etc.),
            // send back HTTP 500 (server error) with a failure message
            return ResponseEntity.status(500).body("Failed to delete the files! 🔥🔥🔥");
        }
    }
}
















