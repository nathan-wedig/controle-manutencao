package com.manutencao.controller;

import com.manutencao.dto.AnexoResponse;
import com.manutencao.dto.FornecedorResponse;
import com.manutencao.dto.MaquinaResponse;
import com.manutencao.dto.PastaResponse;
import com.manutencao.model.Anexo;
import com.manutencao.model.Maquina;
import com.manutencao.model.enums.StatusMaquina;
import com.manutencao.service.MaquinaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/maquinas")
public class MaquinaController {

    private final MaquinaService maquinaService;

    public MaquinaController(MaquinaService maquinaService) {
        this.maquinaService = maquinaService;
    }

    @GetMapping
    public ResponseEntity<Page<MaquinaResponse>> listarTodas(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(maquinaService.listarTodas(search, pageable));
    }

    @GetMapping("/relatorio")
    public ResponseEntity<List<MaquinaResponse>> relatorio(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String setor,
            @RequestParam(required = false) String status) {
        StatusMaquina statusEnum = null;
        if (status != null && !status.isEmpty()) {
            statusEnum = StatusMaquina.valueOf(status);
        }
        return ResponseEntity.ok(maquinaService.listarTodasRelatorio(search, setor, statusEnum));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MaquinaResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(maquinaService.buscarPorId(id));
    }

    @GetMapping("/codigo/{codigo}")
    public ResponseEntity<MaquinaResponse> buscarPorCodigo(@PathVariable String codigo) {
        return ResponseEntity.ok(maquinaService.buscarPorCodigo(codigo));
    }

    @GetMapping("/qrcode/{hash}")
    public ResponseEntity<MaquinaResponse> buscarPorQrcode(@PathVariable String hash) {
        return ResponseEntity.ok(maquinaService.buscarPorQrcode(hash));
    }

    @PostMapping
    public ResponseEntity<MaquinaResponse> criar(@RequestBody Maquina maquina) {
        return ResponseEntity.ok(maquinaService.criar(maquina));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MaquinaResponse> atualizar(@PathVariable UUID id, @RequestBody Maquina maquina) {
        return ResponseEntity.ok(maquinaService.atualizar(id, maquina));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        maquinaService.deletar(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/fornecedores")
    public ResponseEntity<List<FornecedorResponse>> listarFornecedores(@PathVariable UUID id) {
        return ResponseEntity.ok(maquinaService.listarFornecedores(id));
    }

    @PostMapping("/{id}/fornecedores/{fornecedorId}")
    public ResponseEntity<Void> adicionarFornecedor(
            @PathVariable UUID id,
            @PathVariable UUID fornecedorId,
            @RequestParam(required = false) String observacao) {
        maquinaService.adicionarFornecedor(id, fornecedorId, observacao);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/fornecedores/{fornecedorId}")
    public ResponseEntity<Void> removerFornecedor(@PathVariable UUID id, @PathVariable UUID fornecedorId) {
        maquinaService.removerFornecedor(id, fornecedorId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/pastas")
    public ResponseEntity<List<PastaResponse>> listarPastas(@PathVariable UUID id) {
        return ResponseEntity.ok(maquinaService.listarPastas(id));
    }

    @PostMapping("/{id}/pastas")
    public ResponseEntity<PastaResponse> criarPasta(
            @PathVariable UUID id,
            @RequestParam String nome,
            @RequestParam(required = false) UUID pastaPaiId) {
        return ResponseEntity.ok(maquinaService.criarPasta(id, nome, pastaPaiId));
    }

    @DeleteMapping("/{id}/pastas/{pastaId}")
    public ResponseEntity<Void> deletarPasta(@PathVariable UUID id, @PathVariable UUID pastaId) {
        maquinaService.deletarPasta(id, pastaId);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/anexos")
    public ResponseEntity<Void> associarAnexos(@PathVariable UUID id, @RequestBody List<Anexo> anexos) {
        maquinaService.associarAnexos(id, anexos);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/anexos/{anexoId}/mover")
    public ResponseEntity<AnexoResponse> moverAnexo(
            @PathVariable UUID id,
            @PathVariable UUID anexoId,
            @RequestParam(required = false) UUID pastaId) {
        return ResponseEntity.ok(maquinaService.moverAnexo(id, anexoId, pastaId));
    }
}
