package com.manutencao.dto;

import com.manutencao.model.PlanoPreventiva;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class PlanoPreventivaResponse {

    private UUID id;
    private String nome;
    private String descricao;
    private Integer periodicidadeDias;
    private UUID maquinaId;
    private String maquinaNome;
    private UUID responsavelId;
    private String responsavelNome;
    private LocalDate proximaExecucao;
    private LocalDate ultimaExecucao;
    private boolean ativo;
    private List<ChecklistItemResponse> checklistItens = new ArrayList<>();

    public static PlanoPreventivaResponse fromEntity(PlanoPreventiva p) {
        PlanoPreventivaResponse r = new PlanoPreventivaResponse();
        r.setId(p.getId());
        r.setNome(p.getNome());
        r.setDescricao(p.getDescricao());
        r.setPeriodicidadeDias(p.getPeriodicidadeDias());
        r.setMaquinaId(p.getMaquinaId());
        r.setMaquinaNome(p.getMaquinaNome());
        r.setResponsavelId(p.getResponsavelId());
        r.setResponsavelNome(p.getResponsavelNome());
        r.setProximaExecucao(p.getProximaExecucao());
        r.setUltimaExecucao(p.getUltimaExecucao());
        r.setAtivo(p.isAtivo());
        if (p.getChecklistItens() != null) {
            r.setChecklistItens(p.getChecklistItens().stream()
                    .map(ChecklistItemResponse::fromEntity).collect(Collectors.toList()));
        }
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Integer getPeriodicidadeDias() { return periodicidadeDias; }
    public void setPeriodicidadeDias(Integer periodicidadeDias) { this.periodicidadeDias = periodicidadeDias; }
    public UUID getMaquinaId() { return maquinaId; }
    public void setMaquinaId(UUID maquinaId) { this.maquinaId = maquinaId; }
    public String getMaquinaNome() { return maquinaNome; }
    public void setMaquinaNome(String maquinaNome) { this.maquinaNome = maquinaNome; }
    public UUID getResponsavelId() { return responsavelId; }
    public void setResponsavelId(UUID responsavelId) { this.responsavelId = responsavelId; }
    public String getResponsavelNome() { return responsavelNome; }
    public void setResponsavelNome(String responsavelNome) { this.responsavelNome = responsavelNome; }
    public LocalDate getProximaExecucao() { return proximaExecucao; }
    public void setProximaExecucao(LocalDate proximaExecucao) { this.proximaExecucao = proximaExecucao; }
    public LocalDate getUltimaExecucao() { return ultimaExecucao; }
    public void setUltimaExecucao(LocalDate ultimaExecucao) { this.ultimaExecucao = ultimaExecucao; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public List<ChecklistItemResponse> getChecklistItens() { return checklistItens; }
    public void setChecklistItens(List<ChecklistItemResponse> checklistItens) { this.checklistItens = checklistItens; }
}
