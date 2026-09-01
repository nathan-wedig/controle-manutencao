package com.manutencao.controller;

import com.manutencao.dto.PlanoPreventivaResponse;
import com.manutencao.model.PlanoPreventiva;
import com.manutencao.service.PlanoPreventivaService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/planos-preventiva")
public class PlanoPreventivaController {

    private final PlanoPreventivaService planoPreventivaService;

    public PlanoPreventivaController(PlanoPreventivaService planoPreventivaService) {
        this.planoPreventivaService = planoPreventivaService;
    }

    @GetMapping
    public ResponseEntity<Page<PlanoPreventivaResponse>> listarTodos(
            @RequestParam(required = false) String search,
            Pageable pageable) {
        return ResponseEntity.ok(planoPreventivaService.listarTodos(search, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PlanoPreventivaResponse> buscarPorId(@PathVariable UUID id) {
        return ResponseEntity.ok(planoPreventivaService.buscarPorId(id));
    }

    @GetMapping("/maquina/{maquinaId}")
    public ResponseEntity<List<PlanoPreventivaResponse>> listarPorMaquina(@PathVariable UUID maquinaId) {
        return ResponseEntity.ok(planoPreventivaService.listarPorMaquina(maquinaId));
    }

    @GetMapping("/proximos")
    public ResponseEntity<List<PlanoPreventivaResponse>> listarProximos(
            @RequestParam(defaultValue = "30") Integer dias) {
        return ResponseEntity.ok(planoPreventivaService.listarProximos(dias));
    }

    @PostMapping
    public ResponseEntity<PlanoPreventivaResponse> criar(@RequestBody PlanoPreventiva plano) {
        return ResponseEntity.ok(planoPreventivaService.criar(plano));
    }

    @PutMapping("/{id}")
    public ResponseEntity<PlanoPreventivaResponse> atualizar(@PathVariable UUID id,
                                                              @RequestBody PlanoPreventiva plano) {
        return ResponseEntity.ok(planoPreventivaService.atualizar(id, plano));
    }

    @PutMapping("/{id}/executar")
    public ResponseEntity<PlanoPreventivaResponse> executar(@PathVariable UUID id) {
        return ResponseEntity.ok(planoPreventivaService.executar(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable UUID id) {
        planoPreventivaService.deletar(id);
        return ResponseEntity.noContent().build();
    }
}
