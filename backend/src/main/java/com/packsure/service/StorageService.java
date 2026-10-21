package com.packsure.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.UUID;

@Service
public class StorageService {

    @Value("${packsure.storage.path}")
    private String baseStoragePath;

    public void init() {
        try {
            Files.createDirectories(Paths.get(baseStoragePath, "inspections"));
            Files.createDirectories(Paths.get(baseStoragePath, "reports"));
        } catch (IOException e) {
            throw new RuntimeException("Could not initialize storage directory", e);
        }
    }

    public String storeInspectionImage(String inspectionNumber, MultipartFile file, String subfolder) {
        init();
        try {
            String sanitizedFilename = UUID.randomUUID() + "_" + sanitizeFilename(file.getOriginalFilename());
            Path targetDir = Paths.get(baseStoragePath, "inspections", inspectionNumber, subfolder);
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(sanitizedFilename);
            try (InputStream is = file.getInputStream()) {
                Files.copy(is, targetPath, StandardCopyOption.REPLACE_EXISTING);
            }
            return targetPath.toAbsolutePath().toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store file: " + e.getMessage(), e);
        }
    }

    public String storeBytes(String inspectionNumber, byte[] data, String subfolder, String extension) {
        init();
        try {
            String filename = UUID.randomUUID() + "." + extension;
            Path targetDir = Paths.get(baseStoragePath, "inspections", inspectionNumber, subfolder);
            Files.createDirectories(targetDir);

            Path targetPath = targetDir.resolve(filename);
            Files.write(targetPath, data);
            return targetPath.toAbsolutePath().toString();
        } catch (IOException e) {
            throw new RuntimeException("Failed to store bytes: " + e.getMessage(), e);
        }
    }

    public String computeFileHash(String filePath) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] fileBytes = Files.readAllBytes(Paths.get(filePath));
            byte[] hashBytes = digest.digest(fileBytes);
            StringBuilder sb = new StringBuilder();
            for (byte b : hashBytes) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException | IOException e) {
            return "HASH_COMPUTATION_ERROR";
        }
    }

    private String sanitizeFilename(String filename) {
        if (filename == null) return "image.jpg";
        return filename.replaceAll("[^a-zA-Z0-9.-]", "_");
    }
}
