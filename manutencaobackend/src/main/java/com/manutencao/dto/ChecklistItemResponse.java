package com.manutencao.dto;

import com.manutencao.model.ChecklistItem;

import java.util.UUID;

public class ChecklistItemResponse {

    private UUID id;
    private String item;
    private String tipo;
    private boolean obrigatorio;

    public static ChecklistItemResponse fromEntity(ChecklistItem ci) {
        ChecklistItemResponse r = new ChecklistItemResponse();
        r.setId(ci.getId());
        r.setItem(ci.getItem());
        r.setTipo(ci.getTipo());
        r.setObrigatorio(ci.isObrigatorio());
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getItem() { return item; }
    public void setItem(String item) { this.item = item; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public boolean isObrigatorio() { return obrigatorio; }
    public void setObrigatorio(boolean obrigatorio) { this.obrigatorio = obrigatorio; }
}
