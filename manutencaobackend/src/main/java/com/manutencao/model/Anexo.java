package com.manutencao.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "anexos")
public class Anexo {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nomeOriginal;

    private String tipo;

    private String extensao;

    private Long tamanho;

    private String categoria;

    @Column(nullable = false)
    private String url;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pasta_id")
    private Pasta pasta;

    @Column(name = "pasta_nome")
    private String pastaNome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquina_id")
    private Maquina maquina;

    public Anexo() {}

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
    public Pasta getPasta() { return pasta; }
    public void setPasta(Pasta pasta) { this.pasta = pasta; }
    public String getPastaNome() { return pastaNome; }
    public void setPastaNome(String pastaNome) { this.pastaNome = pastaNome; }
    public Maquina getMaquina() { return maquina; }
    public void setMaquina(Maquina maquina) { this.maquina = maquina; }
}
