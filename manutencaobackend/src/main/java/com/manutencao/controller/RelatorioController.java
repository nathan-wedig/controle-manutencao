package com.manutencao.controller;

import com.manutencao.dto.OrdemServicoResponse;
import com.manutencao.dto.RelatorioMaquinaOSRequest;
import com.manutencao.dto.RelatorioResponse;
import com.manutencao.service.RelatorioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/relatorios")
public class RelatorioController {

    private final RelatorioService relatorioService;

    public RelatorioController(RelatorioService relatorioService) {
        this.relatorioService = relatorioService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<RelatorioResponse> dashboard(
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fim) {
        return ResponseEntity.ok(relatorioService.gerarDashboard(inicio, fim));
    }

    @GetMapping("/periodo/maquina/{maquinaId}")
    public ResponseEntity<List<OrdemServicoResponse>> periodoMaquina(
            @PathVariable UUID maquinaId,
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fim) {
        return ResponseEntity.ok(
                relatorioService.listarPorMaquinaPeriodo(maquinaId, inicio, fim).stream()
                        .map(OrdemServicoResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    @GetMapping("/periodo/setor")
    public ResponseEntity<List<OrdemServicoResponse>> periodoSetor(
            @RequestParam String setor,
            @RequestParam LocalDate inicio,
            @RequestParam LocalDate fim) {
        return ResponseEntity.ok(
                relatorioService.listarPorSetorPeriodo(setor, inicio, fim).stream()
                        .map(OrdemServicoResponse::fromEntity)
                        .collect(Collectors.toList()));
    }

    @PostMapping("/maquinas-os")
    public ResponseEntity<List<RelatorioResponse.RelatorioMaquinaOSResponse>> maquinasOS(
            @RequestBody RelatorioMaquinaOSRequest request) {
        return ResponseEntity.ok(
                relatorioService.gerarRelatorioMaquinas(
                        request.getMaquinaIds(), request.getInicio(), request.getFim()));
    }
}
