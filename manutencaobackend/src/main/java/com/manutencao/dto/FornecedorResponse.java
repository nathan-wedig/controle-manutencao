package com.manutencao.dto;

import com.manutencao.model.Fornecedor;

import java.util.UUID;

public class FornecedorResponse {

    private UUID id;
    private String nome;
    private String cnpj;
    private String nomeRepresentante;
    private String telefone;
    private String email;
    private String tipoServico;
    private String detalhesServico;
    private String whatsappRepresentante;
    private String formasPagamento;
    private String observacao;

    public static FornecedorResponse fromEntity(Fornecedor f) {
        FornecedorResponse r = new FornecedorResponse();
        r.setId(f.getId());
        r.setNome(f.getNome());
        r.setCnpj(f.getCnpj());
        r.setNomeRepresentante(f.getNomeRepresentante());
        r.setTelefone(f.getTelefone());
        r.setEmail(f.getEmail());
        r.setTipoServico(f.getTipoServico());
        r.setDetalhesServico(f.getDetalhesServico());
        r.setWhatsappRepresentante(f.getWhatsappRepresentante());
        r.setFormasPagamento(f.getFormasPagamento());
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getCnpj() { return cnpj; }
    public void setCnpj(String cnpj) { this.cnpj = cnpj; }
    public String getNomeRepresentante() { return nomeRepresentante; }
    public void setNomeRepresentante(String nomeRepresentante) { this.nomeRepresentante = nomeRepresentante; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTipoServico() { return tipoServico; }
    public void setTipoServico(String tipoServico) { this.tipoServico = tipoServico; }
    public String getDetalhesServico() { return detalhesServico; }
    public void setDetalhesServico(String detalhesServico) { this.detalhesServico = detalhesServico; }
    public String getWhatsappRepresentante() { return whatsappRepresentante; }
    public void setWhatsappRepresentante(String whatsappRepresentante) { this.whatsappRepresentante = whatsappRepresentante; }
    public String getFormasPagamento() { return formasPagamento; }
    public void setFormasPagamento(String formasPagamento) { this.formasPagamento = formasPagamento; }
    public String getObservacao() { return observacao; }
    public void setObservacao(String observacao) { this.observacao = observacao; }
}
