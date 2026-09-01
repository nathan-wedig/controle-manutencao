package com.manutencao.controller;

import com.manutencao.dto.OrdemServicoResponse;
import com.manutencao.model.ItemCusto;
import com.manutencao.model.OrdemServico;
import com.manutencao.model.enums.StatusOrdemServico;
import com.manutencao.service.OrdemServicoService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/ordens-servico")
public class OrdemServicoController {

    private final OrdemServicoService ordemServicoService;

    public OrdemServicoController(OrdemServicoService ordemServicoService) {
        this.ordemServicoService = ordemServicoService;
    }

    @GetMapping
    public ResponseEntity<Page<OrdemServicoResponse>> listarTodas(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(ordemServicoService.listarTodas(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrdemServicoResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(ordemServicoService.buscarPorId(id));
    }

    @GetMapping("/maquina/{maquinaId}")
    public ResponseEntity<Page<OrdemServicoResponse>> listarPorMaquina(
            @PathVariable UUID maquinaId,
            Pageable pageable) {
        return ResponseEntity.ok(ordemServicoService.listarPorMaquina(maquinaId, pageable));
    }

    @GetMapping("/tecnico/{tecnicoId}")
    public ResponseEntity<List<OrdemServicoResponse>> listarPorTecnico(@PathVariable UUID tecnicoId) {
        return ResponseEntity.ok(ordemServicoService.listarPorTecnico(tecnicoId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrdemServicoResponse>> listarPorStatus(@PathVariable StatusOrdemServico status) {
        return ResponseEntity.ok(ordemServicoService.listarPorStatus(status));
    }

    @PostMapping
    public ResponseEntity<OrdemServicoResponse> criar(@RequestBody OrdemServico ordemServico) {
        return ResponseEntity.ok(ordemServicoService.criar(ordemServico));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrdemServicoResponse> atualizar(@PathVariable UUID id,
                                                           @RequestBody OrdemServico ordemServico) {
        return ResponseEntity.ok(ordemServicoService.atualizar(id, ordemServico));
    }

    @PutMapping("/{id}/iniciar")
    public ResponseEntity<OrdemServicoResponse> iniciar(@PathVariable UUID id) {
        return ResponseEntity.ok(ordemServicoService.iniciar(id));
    }

    @PutMapping("/{id}/concluir")
    public ResponseEntity<OrdemServicoResponse> concluir(
            @PathVariable UUID id,
            @RequestBody Map<String, Object> body) {
        String acaoFeita = (String) body.get("acaoFeita");
        BigDecimal tempoParado = body.get("tempoParadoHoras") != null
                ? BigDecimal.valueOf(((Number) body.get("tempoParadoHoras")).doubleValue())
                : null;
        String dataConclusaoStr = (String) body.get("dataConclusao");
        LocalDateTime dataConclusao = dataConclusaoStr != null
                ? LocalDateTime.parse(dataConclusaoStr)
                : null;

        @SuppressWarnings("unchecked")
        List<ItemCusto> itensCusto = body.get("itensCusto") != null
                ? ((List<Map<String, Object>>) body.get("itensCusto")).stream().map(m -> {
                    ItemCusto item = new ItemCusto();
                    item.setDescricao((String) m.get("descricao"));
                    item.setUnidade(m.get("unidade") != null ? ((Number) m.get("unidade")).intValue() : null);
                    item.setValorUnitario(m.get("valorUnitario") != null
                            ? BigDecimal.valueOf(((Number) m.get("valorUnitario")).doubleValue())
                            : null);
                    return item;
                }).toList()
                : null;

        return ResponseEntity.ok(ordemServicoService.concluir(id, acaoFeita, tempoParado, itensCusto, dataConclusao));
    }

    @PutMapping("/{id}/cancelar")
    public ResponseEntity<OrdemServicoResponse> cancelar(@PathVariable UUID id) {
        return ResponseEntity.ok(ordemServicoService.cancelar(id));
    }

    @PostMapping("/{id}/anexos/{anexoId}")
    public ResponseEntity<Void> adicionarAnexo(@PathVariable UUID id, @PathVariable UUID anexoId) {
        ordemServicoService.adicionarAnexo(id, anexoId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/anexos/{anexoId}")
    public ResponseEntity<Void> removerAnexo(@PathVariable UUID id, @PathVariable UUID anexoId) {
        ordemServicoService.removerAnexo(id, anexoId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        ordemServicoService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
