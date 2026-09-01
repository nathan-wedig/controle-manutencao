package com.manutencao.dto;

import com.manutencao.model.Maquina;
import com.manutencao.model.enums.StatusMaquina;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class MaquinaResponse {

    private UUID id;
    private String codigoMaquina;
    private String apr;
    private String nr12;
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
    private StatusMaquina status;
    private String observacoes;
    private String qrcodeHash;
    private boolean ativo;
    private List<FornecedorResponse> fornecedores;
    private List<AnexoResponse> anexos;
    private List<PastaResponse> pastas;

    public static MaquinaResponse fromEntity(Maquina m) {
        MaquinaResponse r = new MaquinaResponse();
        r.setId(m.getId());
        r.setCodigoMaquina(m.getCodigoMaquina());
        r.setApr(m.getApr());
        r.setNr12(m.getNr12());
        r.setNome(m.getNome());
        r.setSetor(m.getSetor());
        r.setFonteEnergia(m.getFonteEnergia());
        r.setNomeOperador(m.getNomeOperador());
        r.setNumeroSerie(m.getNumeroSerie());
        r.setAnoFabricacao(m.getAnoFabricacao());
        r.setFabricante(m.getFabricante());
        r.setCnpjFabricante(m.getCnpjFabricante());
        r.setModelo(m.getModelo());
        r.setPeso(m.getPeso());
        r.setDataCompra(m.getDataCompra());
        r.setDataGarantia(m.getDataGarantia());
        r.setStatus(m.getStatus());
        r.setObservacoes(m.getObservacoes());
        r.setQrcodeHash(m.getQrcodeHash());
        r.setAtivo(m.isAtivo());
        if (m.getAnexos() != null) {
            r.setAnexos(m.getAnexos().stream().map(AnexoResponse::fromEntity).collect(Collectors.toList()));
        }
        if (m.getPastas() != null) {
            r.setPastas(m.getPastas().stream().map(PastaResponse::fromEntity).collect(Collectors.toList()));
        }
        if (m.getMaquinaFornecedores() != null) {
            r.setFornecedores(m.getMaquinaFornecedores().stream()
                    .map(mf -> {
                        FornecedorResponse fr = FornecedorResponse.fromEntity(mf.getFornecedor());
                        if (mf.getObservacao() != null) fr.setObservacao(mf.getObservacao());
                        return fr;
                    })
                    .collect(Collectors.toList()));
        }
        return r;
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
    public List<FornecedorResponse> getFornecedores() { return fornecedores; }
    public void setFornecedores(List<FornecedorResponse> fornecedores) { this.fornecedores = fornecedores; }
    public List<AnexoResponse> getAnexos() { return anexos; }
    public void setAnexos(List<AnexoResponse> anexos) { this.anexos = anexos; }
    public List<PastaResponse> getPastas() { return pastas; }
    public void setPastas(List<PastaResponse> pastas) { this.pastas = pastas; }
}
