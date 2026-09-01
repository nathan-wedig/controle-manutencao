package com.manutencao.dto;

import com.manutencao.model.Pasta;

import java.util.UUID;

public class PastaResponse {

    private UUID id;
    private String nome;
    private UUID maquinaId;
    private UUID pastaPaiId;

    public static PastaResponse fromEntity(Pasta p) {
        PastaResponse r = new PastaResponse();
        r.setId(p.getId());
        r.setNome(p.getNome());
        if (p.getMaquina() != null) r.setMaquinaId(p.getMaquina().getId());
        if (p.getPastaPai() != null) r.setPastaPaiId(p.getPastaPai().getId());
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public UUID getMaquinaId() { return maquinaId; }
    public void setMaquinaId(UUID maquinaId) { this.maquinaId = maquinaId; }
    public UUID getPastaPaiId() { return pastaPaiId; }
    public void setPastaPaiId(UUID pastaPaiId) { this.pastaPaiId = pastaPaiId; }
}
