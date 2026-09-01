package com.manutencao.model;

import com.manutencao.model.enums.PrioridadeOrdemServico;
import com.manutencao.model.enums.StatusOrdemServico;
import com.manutencao.model.enums.TipoOrdemServico;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "ordens_servico")
public class OrdemServico {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "numero_os", unique = true, nullable = false)
    private String numeroOS;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoOrdemServico tipo;

    @Enumerated(EnumType.STRING)
    private PrioridadeOrdemServico prioridade = PrioridadeOrdemServico.MEDIA;

    @Enumerated(EnumType.STRING)
    private StatusOrdemServico status = StatusOrdemServico.ABERTA;

    private String setor;

    @Column(columnDefinition = "TEXT")
    private String problemaRelatado;

    @Column(columnDefinition = "TEXT")
    private String acaoFeita;

    @Column(columnDefinition = "TEXT")
    private String observacoes;

    @Column(name = "maquina_id")
    private UUID maquinaId;

    private String maquinaNome;

    private String maquinaCodigo;

    @Column(name = "tecnico_responsavel_id")
    private UUID tecnicoResponsavelId;

    private String tecnicoNome;

    private LocalDateTime dataAbertura = LocalDateTime.now();

    private LocalDateTime dataConclusao;

    private LocalDate dataMaxima;

    private LocalDate dataAgendamento;

    private BigDecimal tempoParadoHoras;

    private BigDecimal custoPecas;

    private BigDecimal custoServico;

    private BigDecimal custoTotal;

    @Column(name = "plano_preventiva_id")
    private UUID planoPreventivaId;

    private String planoPreventivaNome;

    @Column(name = "fornecedor_id")
    private UUID fornecedorId;

    private String fornecedorNome;

    @Column(columnDefinition = "TEXT")
    private String observacoesTerceiro;

    @OneToMany(mappedBy = "ordemServico", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCusto> itensCusto = new ArrayList<>();

    @ManyToMany
    @JoinTable(name = "os_anexos",
            joinColumns = @JoinColumn(name = "ordem_servico_id"),
            inverseJoinColumns = @JoinColumn(name = "anexo_id"))
    private List<Anexo> anexos = new ArrayList<>();

    public OrdemServico() {}

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
    public List<ItemCusto> getItensCusto() { return itensCusto; }
    public void setItensCusto(List<ItemCusto> itensCusto) { this.itensCusto = itensCusto; }
    public List<Anexo> getAnexos() { return anexos; }
    public void setAnexos(List<Anexo> anexos) { this.anexos = anexos; }
}
