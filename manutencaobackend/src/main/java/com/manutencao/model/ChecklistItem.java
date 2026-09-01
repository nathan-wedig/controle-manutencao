package com.manutencao.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "checklist_itens")
public class ChecklistItem {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String item;

    private String tipo;

    private boolean obrigatorio;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "plano_preventiva_id", nullable = false)
    private PlanoPreventiva planoPreventiva;

    public ChecklistItem() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public boolean isObrigatorio() { return obrigatorio; }
    public void setObrigatorio(boolean obrigatorio) { this.obrigatorio = obrigatorio; }
    public PlanoPreventiva getPlanoPreventiva() { return planoPreventiva; }
    public void setPlanoPreventiva(PlanoPreventiva planoPreventiva) { this.planoPreventiva = planoPreventiva; }
}
