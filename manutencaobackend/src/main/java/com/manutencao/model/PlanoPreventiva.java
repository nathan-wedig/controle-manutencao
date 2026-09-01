package com.manutencao.model;

import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "planos_preventiva")
@SQLDelete(sql = "UPDATE planos_preventiva SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
public class PlanoPreventiva {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private Integer periodicidadeDias;

    @Column(name = "maquina_id")
    private UUID maquinaId;

    private String maquinaNome;

    @Column(name = "responsavel_id")
    private UUID responsavelId;

    private String responsavelNome;

    @Column(nullable = false)
    private LocalDate proximaExecucao;

    private LocalDate ultimaExecucao;

    @Column(nullable = false)
    private boolean ativo = true;

    @OneToMany(mappedBy = "planoPreventiva", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ChecklistItem> checklistItens = new ArrayList<>();

    public PlanoPreventiva() {}

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
    public List<ChecklistItem> getChecklistItens() { return checklistItens; }
    public void setChecklistItens(List<ChecklistItem> checklistItens) { this.checklistItens = checklistItens; }
}
