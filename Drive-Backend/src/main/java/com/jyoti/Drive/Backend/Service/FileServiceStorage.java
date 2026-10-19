package com.jyoti.Drive.Backend.Service;

import com.jyoti.Drive.Backend.Entity.FileEntity;
import com.jyoti.Drive.Backend.Repository.FileRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FileServiceStorage {

    // Reads the value of "file.upload-dir" from application.properties (e.g. uploads/)
    @Value("${file.upload-dir}")
    private String uploadDir;

    // Repository used to save file details into the database
    private final FileRepository fileRepository;

    // Spring passes the single FileRepository object here. It is a constructor injection using Spring
    public FileServiceStorage(FileRepository fileRepository) {
        this.fileRepository = fileRepository;
    }

    // Saves the uploaded file under the given parent folder (by ID) and returns
    // a String result (e.g., the stored file path/name). Throws IOException if writing fails.
    public String saveFile(MultipartFile file, Long parentFolderId) throws IOException {

        // try block: code that might fail (file system errors, disk full, etc.)
        try {
            // Step 1: Get the upload folder path (e.g. uploads/)
            Path uploadPath = Paths.get(uploadDir);

            // If the folder does not exist yet, create it
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            // Step 2: Get the original name of the uploaded file (e.g. report.pdf)
            String fileName = file.getOriginalFilename();

            // Build the full path where the file will be saved (e.g. uploads/report.pdf)
            Path filePath = uploadPath.resolve(fileName);

            // Step 3: Copy the file into the folder
            // REPLACE_EXISTING means if a file with the same name exists, overwrite it
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            // Step 4: Prepare the file details (metadata) to store in the database
            FileEntity fileEntity = new FileEntity();

            fileEntity.setName(fileName);                  // file name
            fileEntity.setPath(filePath.toString());       // where the file is stored
            fileEntity.setSize(file.getSize());            // file size in bytes
            fileEntity.setType("file");                    // marks this entry as a file (not a folder)
            fileEntity.setParentFolderId(parentFolderId);  // folder that contains this file
            fileEntity.setCreatedAt(LocalDateTime.now());  // current date and time

            // Step 5: Save the details into the database
            fileRepository.save(fileEntity);

            // Return a success message
            return "File uploaded Successfully 😁😁😁";
        }
        // catch block: runs if reading/writing the file fails
        catch (IOException e) {
            // Print the error in the console to help with debugging
            e.printStackTrace();

            // Return a friendly error message instead of crashing
            return "File upload failed: " + e.getMessage()+ " 😭😭😭";
        }
    }

    // Returns all files in the given folder (root-level files if parentFolderId is null)
    public List<FileEntity> getFilesInFolder(Long parentFolderId){

        // Check if no folder is given (means we want root-level files)
        if(parentFolderId == null)
        {
            // Get all files from the database
            return fileRepository.findAll()
                    // Convert the list into a stream so we can filter it
                    .stream()
                    // Keep only files that have no parent folder
                    .filter(f->f.getParentFolderId()==null)
                    // Put the filtered files back into a list
                    .collect(Collectors.toList());
        }

        // Otherwise, a folder ID is given
        else{
            // Get all files from the database
            return fileRepository.findAll()
                    // Convert the list into a stream so we can filter it
                    .stream()
                    // Keep only files whose parent folder matches the given folder ID
                    .filter(f->parentFolderId.equals(f.getParentFolderId()))
                    // Put the filtered files back into a list
                    .collect(Collectors.toList());
        }
    }

    // Finds a file by its ID and returns it
    public FileEntity getFileById(Long id){
        // Search the database for the file with this ID
        return fileRepository.findById(id)
                // If no file is found, throw an error with this message
                .orElseThrow(()->new RuntimeException("File not found by the id you given! ❌"));
    }

    // Deletes the file with the given ID from the database
    public void deleteById(Long id)
    {
        fileRepository.deleteById(id);
    }

}
