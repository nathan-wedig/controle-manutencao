package com.manutencao.controller;

import com.manutencao.dto.FornecedorResponse;
import com.manutencao.model.Fornecedor;
import com.manutencao.service.FornecedorService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/fornecedores")
public class FornecedorController {

    private final FornecedorService fornecedorService;

    public FornecedorController(FornecedorService fornecedorService) {
        this.fornecedorService = fornecedorService;
    }

    @GetMapping
    public ResponseEntity<Page<FornecedorResponse>> listarTodos(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(fornecedorService.listarTodos(search, pageable));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<FornecedorResponse>> search(
            @RequestParam(required = false) String q,
            Pageable pageable) {
        return ResponseEntity.ok(fornecedorService.listarTodos(q, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FornecedorResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(fornecedorService.buscarPorId(id));
    }

    @PostMapping
    public ResponseEntity<FornecedorResponse> criar(@RequestBody Fornecedor fornecedor) {
        return ResponseEntity.ok(fornecedorService.criar(fornecedor));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FornecedorResponse> atualizar(@PathVariable UUID id,
                                                         @RequestBody Fornecedor fornecedor) {
        return ResponseEntity.ok(fornecedorService.atualizar(id, fornecedor));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        fornecedorService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
