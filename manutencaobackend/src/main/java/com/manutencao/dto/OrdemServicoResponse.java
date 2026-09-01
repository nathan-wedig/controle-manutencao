package com.manutencao.dto;

import com.manutencao.model.ItemCusto;
import com.manutencao.model.OrdemServico;
import com.manutencao.model.enums.PrioridadeOrdemServico;
import com.manutencao.model.enums.StatusOrdemServico;
import com.manutencao.model.enums.TipoOrdemServico;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class OrdemServicoResponse {

    private UUID id;
    private String numeroOS;
    private TipoOrdemServico tipo;
    private PrioridadeOrdemServico prioridade;
    private StatusOrdemServico status;
    private String setor;
    private String problemaRelatado;
    private String acaoFeita;
    private String observacoes;
    private UUID maquinaId;
    private String maquinaNome;
    private String maquinaCodigo;
    private UUID tecnicoResponsavelId;
    private String tecnicoNome;
    private LocalDateTime dataAbertura;
    private LocalDateTime dataConclusao;
    private LocalDate dataMaxima;
    private LocalDate dataAgendamento;
    private BigDecimal tempoParadoHoras;
    private BigDecimal custoPecas;
    private BigDecimal custoServico;
    private BigDecimal custoTotal;
    private UUID planoPreventivaId;
    private String planoPreventivaNome;
    private UUID fornecedorId;
    private String fornecedorNome;
    private String observacoesTerceiro;
    private List<ItemCustoResponse> itensCusto = new ArrayList<>();
    private List<AnexoResponse> anexos = new ArrayList<>();

    public static OrdemServicoResponse fromEntity(OrdemServico os) {
        OrdemServicoResponse r = new OrdemServicoResponse();
        r.setId(os.getId());
        r.setNumeroOS(os.getNumeroOS());
        r.setTipo(os.getTipo());
        r.setPrioridade(os.getPrioridade());
        r.setStatus(os.getStatus());
        r.setSetor(os.getSetor());
        r.setProblemaRelatado(os.getProblemaRelatado());
        r.setAcaoFeita(os.getAcaoFeita());
        r.setObservacoes(os.getObservacoes());
        r.setMaquinaId(os.getMaquinaId());
        r.setMaquinaNome(os.getMaquinaNome());
        r.setMaquinaCodigo(os.getMaquinaCodigo());
        r.setTecnicoResponsavelId(os.getTecnicoResponsavelId());
        r.setTecnicoNome(os.getTecnicoNome());
        r.setDataAbertura(os.getDataAbertura());
        r.setDataConclusao(os.getDataConclusao());
        r.setDataMaxima(os.getDataMaxima());
        r.setDataAgendamento(os.getDataAgendamento());
        r.setTempoParadoHoras(os.getTempoParadoHoras());
        r.setCustoPecas(os.getCustoPecas());
        r.setCustoServico(os.getCustoServico());
        r.setCustoTotal(os.getCustoTotal());
        r.setPlanoPreventivaId(os.getPlanoPreventivaId());
        r.setPlanoPreventivaNome(os.getPlanoPreventivaNome());
        r.setFornecedorId(os.getFornecedorId());
        r.setFornecedorNome(os.getFornecedorNome());
        r.setObservacoesTerceiro(os.getObservacoesTerceiro());
        if (os.getItensCusto() != null) {
            r.setItensCusto(os.getItensCusto().stream()
                    .map(ItemCustoResponse::fromEntity).collect(Collectors.toList()));
        }
        if (os.getAnexos() != null) {
            r.setAnexos(os.getAnexos().stream().map(AnexoResponse::fromEntity).collect(Collectors.toList()));
        }
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getNumeroOS() { return numeroOS; }
    public void setNumeroOS(String numeroOS) { this.numeroOS = numeroOS; }
    public TipoOrdemServico getTipo() { return tipo; }
    public void setTipo(TipoOrdemServico tipo) { this.tipo = tipo; }
    public PrioridadeOrdemServico getPrioridade() { return prioridade; }
    public void setPrioridade(PrioridadeOrdemServico prioridade) { this.prioridade = prioridade; }
    public StatusOrdemServico getStatus() { return status; }
    public void setStatus(StatusOrdemServico status) { this.status = status; }
    public String getSetor() { return setor; }
    public void setSetor(String setor) { this.setor = setor; }
    public String getProblemaRelatado() { return problemaRelatado; }
    public void setProblemaRelatado(String problemaRelatado) { this.problemaRelatado = problemaRelatado; }
    public String getAcaoFeita() { return acaoFeita; }
    public void setAcaoFeita(String acaoFeita) { this.acaoFeita = acaoFeita; }
    public String getObservacoes() { return observacoes; }
    public void setObservacoes(String observacoes) { this.observacoes = observacoes; }
    public UUID getMaquinaId() { return maquinaId; }
    public void setMaquinaId(UUID maquinaId) { this.maquinaId = maquinaId; }
    public String getMaquinaNome() { return maquinaNome; }
    public void setMaquinaNome(String maquinaNome) { this.maquinaNome = maquinaNome; }
    public String getMaquinaCodigo() { return maquinaCodigo; }
    public void setMaquinaCodigo(String maquinaCodigo) { this.maquinaCodigo = maquinaCodigo; }
    public UUID getTecnicoResponsavelId() { return tecnicoResponsavelId; }
    public void setTecnicoResponsavelId(UUID tecnicoResponsavelId) { this.tecnicoResponsavelId = tecnicoResponsavelId; }
    public String getTecnicoNome() { return tecnicoNome; }
    public void setTecnicoNome(String tecnicoNome) { this.tecnicoNome = tecnicoNome; }
    public LocalDateTime getDataAbertura() { return dataAbertura; }
    public void setDataAbertura(LocalDateTime dataAbertura) { this.dataAbertura = dataAbertura; }
    public LocalDateTime getDataConclusao() { return dataConclusao; }
    public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }
    public LocalDate getDataMaxima() { return dataMaxima; }
    public void setDataMaxima(LocalDate dataMaxima) { this.dataMaxima = dataMaxima; }
    public LocalDate getDataAgendamento() { return dataAgendamento; }
    public void setDataAgendamento(LocalDate dataAgendamento) { this.dataAgendamento = dataAgendamento; }
    public BigDecimal getTempoParadoHoras() { return tempoParadoHoras; }
    public void setTempoParadoHoras(BigDecimal tempoParadoHoras) { this.tempoParadoHoras = tempoParadoHoras; }
    public BigDecimal getCustoPecas() { return custoPecas; }
    public void setCustoPecas(BigDecimal custoPecas) { this.custoPecas = custoPecas; }
    public BigDecimal getCustoServico() { return custoServico; }
    public void setCustoServico(BigDecimal custoServico) { this.custoServico = custoServico; }
    public BigDecimal getCustoTotal() { return custoTotal; }
    public void setCustoTotal(BigDecimal custoTotal) { this.custoTotal = custoTotal; }
    public UUID getPlanoPreventivaId() { return planoPreventivaId; }
    public void setPlanoPreventivaId(UUID planoPreventivaId) { this.planoPreventivaId = planoPreventivaId; }
    public String getPlanoPreventivaNome() { return planoPreventivaNome; }
    public void setPlanoPreventivaNome(String planoPreventivaNome) { this.planoPreventivaNome = planoPreventivaNome; }
    public UUID getFornecedorId() { return fornecedorId; }
    public void setFornecedorId(UUID fornecedorId) { this.fornecedorId = fornecedorId; }
    public String getFornecedorNome() { return fornecedorNome; }
    public void setFornecedorNome(String fornecedorNome) { this.fornecedorNome = fornecedorNome; }
    public String getObservacoesTerceiro() { return observacoesTerceiro; }
    public void setObservacoesTerceiro(String observacoesTerceiro) { this.observacoesTerceiro = observacoesTerceiro; }
    public List<ItemCustoResponse> getItensCusto() { return itensCusto; }
    public void setItensCusto(List<ItemCustoResponse> itensCusto) { this.itensCusto = itensCusto; }
    public List<AnexoResponse> getAnexos() { return anexos; }
    public void setAnexos(List<AnexoResponse> anexos) { this.anexos = anexos; }
}
