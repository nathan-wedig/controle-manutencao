package com.manutencao.dto;

import com.manutencao.model.ItemCusto;

import java.math.BigDecimal;
import java.util.UUID;

public class ItemCustoResponse {

    private UUID id;
    private String descricao;
    private Integer unidade;
    private BigDecimal valorUnitario;

    public static ItemCustoResponse fromEntity(ItemCusto ic) {
        ItemCustoResponse r = new ItemCustoResponse();
        r.setId(ic.getId());
        r.setDescricao(ic.getDescricao());
        r.setUnidade(ic.getUnidade());
        r.setValorUnitario(ic.getValorUnitario());
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getDescricao() { return descricao; }
    public void setDescricao(String descricao) { this.descricao = descricao; }
    public Integer getUnidade() { return unidade; }
    public void setUnidade(Integer unidade) { this.unidade = unidade; }
    public BigDecimal getValorUnitario() { return valorUnitario; }
    public void setValorUnitario(BigDecimal valorUnitario) { this.valorUnitario = valorUnitario; }
}
