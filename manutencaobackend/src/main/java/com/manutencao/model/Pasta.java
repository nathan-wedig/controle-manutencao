package com.manutencao.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "pastas")
public class Pasta {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String nome;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "maquina_id", nullable = false)
    private Maquina maquina;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pasta_pai_id")
    private Pasta pastaPai;

    public Pasta() {}

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public Maquina getMaquina() { return maquina; }
    public void setMaquina(Maquina maquina) { this.maquina = maquina; }
    public Pasta getPastaPai() { return pastaPai; }
    public void setPastaPai(Pasta pastaPai) { this.pastaPai = pastaPai; }
}
