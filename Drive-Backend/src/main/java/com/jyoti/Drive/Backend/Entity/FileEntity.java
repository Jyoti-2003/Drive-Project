package com.jyoti.Drive.Backend.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

// Marks this class as a database table
@Entity
// The table will be named "Files" in the database
@Table(name = "files")
public class FileEntity {

    // Primary key (unique ID for each file)
    @Id
    // ID is generated automatically by the database
    @GeneratedValue
    private Long id;

    // Name of the file (e.g. report.pdf)
    private String name;

    // Location where the file is stored on the server
    private String path;

    // File type (e.g. pdf, image/png)
    private String type;

    // File size in bytes
    private Long size;

    // ID of the folder that contains this file
    private Long parentFolderId;

    // Date and time when the file was created/uploaded
    private LocalDateTime createdAt;

    public FileEntity() {
    }

    public FileEntity(Long id, String name, String path, String type, Long size, Long parentFolderId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.path = path;
        this.type = type;
        this.size = size;
        this.parentFolderId = parentFolderId;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getSize() {
        return size;
    }

    public void setSize(Long size) {
        this.size = size;
    }

    public Long getParentFolderId() {
        return parentFolderId;
    }

    public void setParentFolderId(Long parentFolderId) {
        this.parentFolderId = parentFolderId;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
