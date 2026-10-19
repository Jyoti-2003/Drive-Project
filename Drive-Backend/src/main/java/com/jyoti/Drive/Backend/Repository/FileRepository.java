package com.jyoti.Drive.Backend.Repository;

import com.jyoti.Drive.Backend.Entity.FileEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
// Repository for FileEntity: provides ready-made CRUD and query methods
// (save, findById, findAll, delete, etc.) via JpaRepository, with Long as the ID type.
public interface FileRepository extends JpaRepository<FileEntity,Long> {

}
