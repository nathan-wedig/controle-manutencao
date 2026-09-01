package com.manutencao.controller;

import com.manutencao.dto.AnexoResponse;
import com.manutencao.service.UploadService;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final UploadService uploadService;

    public UploadController(UploadService uploadService) {
        this.uploadService = uploadService;
    }

    @PostMapping
    public ResponseEntity<AnexoResponse> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) UUID maquinaId) {
        return ResponseEntity.ok(uploadService.upload(file, categoria, maquinaId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        uploadService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
