package com.manutencao.dto;

import com.manutencao.model.Anexo;

import java.util.UUID;

public class AnexoResponse {

    private UUID id;
    private String nomeOriginal;
    private String tipo;
    private String extensao;
    private Long tamanho;
    private String categoria;
    private String url;
    private UUID pastaId;
    private String pastaNome;

    public static AnexoResponse fromEntity(Anexo a) {
        AnexoResponse r = new AnexoResponse();
        r.setId(a.getId());
        r.setNomeOriginal(a.getNomeOriginal());
        r.setTipo(a.getTipo());
        r.setExtensao(a.getExtensao());
        r.setTamanho(a.getTamanho());
        r.setCategoria(a.getCategoria());
        r.setUrl(a.getUrl());
        if (a.getPasta() != null) {
            r.setPastaId(a.getPasta().getId());
            r.setPastaNome(a.getPastaNome());
        }
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNomeOriginal() { return nomeOriginal; }
    public void setNomeOriginal(String nomeOriginal) { this.nomeOriginal = nomeOriginal; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getExtensao() { return extensao; }
    public void setExtensao(String extensao) { this.extensao = extensao; }
    public Long getTamanho() { return tamanho; }
    public void setTamanho(Long tamanho) { this.tamanho = tamanho; }
    public String getCategoria() { return categoria; }
    public void setCategoria(String categoria) { this.categoria = categoria; }
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    public UUID getPastaId() { return pastaId; }
    public void setPastaId(UUID pastaId) { this.pastaId = pastaId; }
    public String getPastaNome() { return pastaNome; }
    public void setPastaNome(String pastaNome) { this.pastaNome = pastaNome; }
}
