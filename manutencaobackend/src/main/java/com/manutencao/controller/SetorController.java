package com.manutencao.controller;

import com.manutencao.model.Setor;
import com.manutencao.service.SetorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/setores")
public class SetorController {

    private final SetorService setorService;

    public SetorController(SetorService setorService) {
        this.setorService = setorService;
    }

    @GetMapping
    public ResponseEntity<List<Setor>> listarTodos() {
        return ResponseEntity.ok(setorService.listarTodos());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Setor> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(setorService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<Setor> criar(@RequestBody Setor setor) {
        return ResponseEntity.ok(setorService.criar(setor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Setor> atualizar(@PathVariable UUID id, @RequestBody Setor setor) {
        return ResponseEntity.ok(setorService.atualizar(id, setor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        setorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
