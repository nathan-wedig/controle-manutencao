package com.manutencao.config;

import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Component
public class UploadConfig {

    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    @PostConstruct
    public void init() {
        try {
            Files.createDirectories(Paths.get(uploadDir).toAbsolutePath().normalize());
        } catch (IOException e) {
            throw new RuntimeException("Nao foi possivel criar o diretorio de upload: " + uploadDir);
        }
    }
}
