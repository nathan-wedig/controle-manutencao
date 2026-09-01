package com.manutencao.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public class RelatorioResponse {

    private BigDecimal custoTotalPeriodo;
    private long totalOSPeriodo;
    private BigDecimal custoMedioOS;
    private List<MesRelatorio> meses;
    private List<MaquinaRelatorio> topMaquinasOS;
    private List<MaquinaRelatorio> topMaquinasCusto;
    private List<SetorRelatorio> topSetoresOS;
    private List<SetorRelatorio> topSetoresCusto;

    public BigDecimal getCustoTotalPeriodo() { return custoTotalPeriodo; }
    public void setCustoTotalPeriodo(BigDecimal custoTotalPeriodo) { this.custoTotalPeriodo = custoTotalPeriodo; }
    public long getTotalOSPeriodo() { return totalOSPeriodo; }
    public void setTotalOSPeriodo(long totalOSPeriodo) { this.totalOSPeriodo = totalOSPeriodo; }
    public BigDecimal getCustoMedioOS() { return custoMedioOS; }
    public void setCustoMedioOS(BigDecimal custoMedioOS) { this.custoMedioOS = custoMedioOS; }
    public List<MesRelatorio> getMeses() { return meses; }
    public void setMeses(List<MesRelatorio> meses) { this.meses = meses; }
    public List<MaquinaRelatorio> getTopMaquinasOS() { return topMaquinasOS; }
    public void setTopMaquinasOS(List<MaquinaRelatorio> topMaquinasOS) { this.topMaquinasOS = topMaquinasOS; }
    public List<MaquinaRelatorio> getTopMaquinasCusto() { return topMaquinasCusto; }
    public void setTopMaquinasCusto(List<MaquinaRelatorio> topMaquinasCusto) { this.topMaquinasCusto = topMaquinasCusto; }
    public List<SetorRelatorio> getTopSetoresOS() { return topSetoresOS; }
    public void setTopSetoresOS(List<SetorRelatorio> topSetoresOS) { this.topSetoresOS = topSetoresOS; }
    public List<SetorRelatorio> getTopSetoresCusto() { return topSetoresCusto; }
    public void setTopSetoresCusto(List<SetorRelatorio> topSetoresCusto) { this.topSetoresCusto = topSetoresCusto; }

    public static class MesRelatorio {
        private int mes;
        private int ano;
        private long quantidadeOS;
        private BigDecimal custoTotal;

        public int getMes() { return mes; }
        public void setMes(int mes) { this.mes = mes; }
        public int getAno() { return ano; }
        public void setAno(int ano) { this.ano = ano; }
        public long getQuantidadeOS() { return quantidadeOS; }
        public void setQuantidadeOS(long quantidadeOS) { this.quantidadeOS = quantidadeOS; }
        public BigDecimal getCustoTotal() { return custoTotal; }
        public void setCustoTotal(BigDecimal custoTotal) { this.custoTotal = custoTotal; }
    }

    public static class MaquinaRelatorio {
        private UUID id;
        private String maquinaNome;
        private String maquinaCodigo;
        private long quantidadeOS;
        private BigDecimal custoTotal;

        public UUID getId() { return id; }
        public void setId(UUID id) { this.id = id; }
        public String getMaquinaNome() { return maquinaNome; }
        public void setMaquinaNome(String maquinaNome) { this.maquinaNome = maquinaNome; }
        public String getMaquinaCodigo() { return maquinaCodigo; }
        public void setMaquinaCodigo(String maquinaCodigo) { this.maquinaCodigo = maquinaCodigo; }
        public long getQuantidadeOS() { return quantidadeOS; }
        public void setQuantidadeOS(long quantidadeOS) { this.quantidadeOS = quantidadeOS; }
        public BigDecimal getCustoTotal() { return custoTotal; }
        public void setCustoTotal(BigDecimal custoTotal) { this.custoTotal = custoTotal; }

        public void setMaquinaId(UUID id) { this.id = id; }
        public UUID getMaquinaId() { return id; }
    }

    public static class RelatorioMaquinaOSResponse {
        private UUID maquinaId;
        private String codigoMaquina;
        private String nome;
        private String apr;
        private String nr12;
        private String fabricante;
        private String modelo;
        private String setor;
        private String numeroSerie;
        private String anoFabricacao;
        private List<OSItemRelatorio> ordensServico;

        public UUID getMaquinaId() { return maquinaId; }
        public void setMaquinaId(UUID maquinaId) { this.maquinaId = maquinaId; }
        public String getCodigoMaquina() { return codigoMaquina; }
        public void setCodigoMaquina(String codigoMaquina) { this.codigoMaquina = codigoMaquina; }
        public String getNome() { return nome; }
        public void setNome(String nome) { this.nome = nome; }
        public String getApr() { return apr; }
        public void setApr(String apr) { this.apr = apr; }
        public String getNr12() { return nr12; }
        public void setNr12(String nr12) { this.nr12 = nr12; }
        public String getFabricante() { return fabricante; }
        public void setFabricante(String fabricante) { this.fabricante = fabricante; }
        public String getModelo() { return modelo; }
        public void setModelo(String modelo) { this.modelo = modelo; }
        public String getSetor() { return setor; }
        public void setSetor(String setor) { this.setor = setor; }
        public String getNumeroSerie() { return numeroSerie; }
        public void setNumeroSerie(String numeroSerie) { this.numeroSerie = numeroSerie; }
        public String getAnoFabricacao() { return anoFabricacao; }
        public void setAnoFabricacao(String anoFabricacao) { this.anoFabricacao = anoFabricacao; }
        public List<OSItemRelatorio> getOrdensServico() { return ordensServico; }
        public void setOrdensServico(List<OSItemRelatorio> ordensServico) { this.ordensServico = ordensServico; }
    }

    public static class OSItemRelatorio {
        private String numeroOS;
        private LocalDateTime dataAbertura;
        private LocalDateTime dataConclusao;
        private String problemaRelatado;
        private String acaoFeita;
        private String status;
        private String tecnicoNome;

        public String getNumeroOS() { return numeroOS; }
        public void setNumeroOS(String numeroOS) { this.numeroOS = numeroOS; }
        public LocalDateTime getDataAbertura() { return dataAbertura; }
        public void setDataAbertura(LocalDateTime dataAbertura) { this.dataAbertura = dataAbertura; }
        public LocalDateTime getDataConclusao() { return dataConclusao; }
        public void setDataConclusao(LocalDateTime dataConclusao) { this.dataConclusao = dataConclusao; }
        public String getProblemaRelatado() { return problemaRelatado; }
        public void setProblemaRelatado(String problemaRelatado) { this.problemaRelatado = problemaRelatado; }
        public String getAcaoFeita() { return acaoFeita; }
        public void setAcaoFeita(String acaoFeita) { this.acaoFeita = acaoFeita; }
        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }
        public String getTecnicoNome() { return tecnicoNome; }
        public void setTecnicoNome(String tecnicoNome) { this.tecnicoNome = tecnicoNome; }
    }

    public static class SetorRelatorio {
        private String setor;
        private long quantidadeOS;
        private BigDecimal custoTotal;

        public String getSetor() { return setor; }
        public void setSetor(String setor) { this.setor = setor; }
        public long getQuantidadeOS() { return quantidadeOS; }
        public void setQuantidadeOS(long quantidadeOS) { this.quantidadeOS = quantidadeOS; }
        public BigDecimal getCustoTotal() { return custoTotal; }
        public void setCustoTotal(BigDecimal custoTotal) { this.custoTotal = custoTotal; }
    }
}
