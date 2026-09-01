package com.manutencao.model;

import com.manutencao.model.enums.StatusMaquina;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "maquinas")
@SQLDelete(sql = "UPDATE maquinas SET ativo = false WHERE id = ?")
@SQLRestriction("ativo = true")
public class Maquina {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "codigo_maquina", unique = true, nullable = false)
    private String codigoMaquina;

    private String apr;

    private String nr12;

    @Column(nullable = false)
    private String nome;

    private String setor;

    private String fonteEnergia;

    private String nomeOperador;

    private String numeroSerie;

    private String anoFabricacao;

    private String fabricante;

    private String cnpjFabricante;

    private String modelo;

    private String peso;

    private LocalDate dataCompra;

    private LocalDate dataGarantia;

    @Enumerated(EnumType.STRING)
    private StatusMaquina status = StatusMaquina.ATIVA;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(unique = true, nullable = false)
    private String qrcodeHash;

    @Column(nullable = false)
    private boolean ativo = true;

    @OneToMany(mappedBy = "maquina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Anexo> anexos = new ArrayList<>();

    @OneToMany(mappedBy = "maquina", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Pasta> pastas = new ArrayList<>();

    @OneToMany(mappedBy = "maquina")
    private List<MaquinaFornecedor> maquinaFornecedores = new ArrayList<>();

    @Transient
    @JsonProperty("fornecedores")
    private List<Map<String, Object>> fornecedoresRequest;

    public Maquina() {}

    @PrePersist
    public void prePersist() {
        if (qrcodeHash == null) {
            qrcodeHash = UUID.randomUUID().toString();
        }
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getCodigoMaquina() { return codigoMaquina; }
    public void setCodigoMaquina(String codigoMaquina) { this.codigoMaquina = codigoMaquina; }
    public String getApr() { return apr; }
    public void setApr(String apr) { this.apr = apr; }
    public String getNr12() { return nr12; }
    public void setNr12(String nr12) { this.nr12 = nr12; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getSetor() { return setor; }
    public void setSetor(String setor) { this.setor = setor; }
    public String getFonteEnergia() { return fonteEnergia; }
    public void setFonteEnergia(String fonteEnergia) { this.fonteEnergia = fonteEnergia; }
    public String getNomeOperador() { return nomeOperador; }
    public void setNomeOperador(String nomeOperador) { this.nomeOperador = nomeOperador; }
    public String getNumeroSerie() { return numeroSerie; }
    public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }
    public String getAnoFabricacao() { return anoFabricacao; }
    public void setAnoFabricacao(String anoFabricacao) { this.anoFabricacao = anoFabricacao; }
    public String getFabricante() { return fabricante; }
    public void setFabricante(String fabricante) { this.fabricante = fabricante; }
    public String getCnpjFabricante() { return cnpjFabricante; }
    public void setCnpjFabricante(String cnpjFabricante) { this.cnpjFabricante = cnpjFabricante; }
    public String getModelo() { return modelo; }
    public void setModelo(String modelo) { this.modelo = modelo; }
    public String getPeso() { return peso; }
    public void setPeso(String peso) { this.peso = peso; }
    public LocalDate getDataCompra() { return dataCompra; }
    public void setDataCompra(LocalDate dataCompra) { this.dataCompra = dataCompra; }
    public LocalDate getDataGarantia() { return dataGarantia; }
    public void setDataGarantia(LocalDate dataGarantia) { this.dataGarantia = dataGarantia; }
    public StatusMaquina getStatus() { return status; }
    public void setStatus(StatusMaquina status) { this.status = status; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public String getQrcodeHash() { return qrcodeHash; }
    public void setQrcodeHash(String qrcodeHash) { this.qrcodeHash = qrcodeHash; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
    public List<Anexo> getAnexos() { return anexos; }
    public void setAnexos(List<Anexo> anexos) { this.anexos = anexos; }
    public List<Pasta> getPastas() { return pastas; }
    public void setPastas(List<Pasta> pastas) { this.pastas = pastas; }
    public List<MaquinaFornecedor> getMaquinaFornecedores() { return maquinaFornecedores; }
    public void setMaquinaFornecedores(List<MaquinaFornecedor> maquinaFornecedores) { this.maquinaFornecedores = maquinaFornecedores; }
    public List<Map<String, Object>> getFornecedoresRequest() { return fornecedoresRequest; }
    public void setFornecedoresRequest(List<Map<String, Object>> fornecedoresRequest) { this.fornecedoresRequest = fornecedoresRequest; }
}
