package com.manutencao.dto;

import java.math.BigDecimal;

public class DashboardResponse {

    private long totalMaquinas;
    private long maquinasAtivas;
    private long maquinasEmManutencao;
    private long maquinasParadas;
    private long ordensAbertas;
    private long ordensConcluidas;
    private long ordensEmergenciais;
    private long alertasAtivos;
    private BigDecimal custoTotalMes;
    private BigDecimal tempoMedioParada;

    public long getTotalMaquinas() { return totalMaquinas; }
    public void setTotalMaquinas(long totalMaquinas) { this.totalMaquinas = totalMaquinas; }
    public long getMaquinasAtivas() { return maquinasAtivas; }
    public void setMaquinasAtivas(long maquinasAtivas) { this.maquinasAtivas = maquinasAtivas; }
    public long getMaquinasEmManutencao() { return maquinasEmManutencao; }
    public void setMaquinasEmManutencao(long maquinasEmManutencao) { this.maquinasEmManutencao = maquinasEmManutencao; }
    public long getMaquinasParadas() { return maquinasParadas; }
    public void setMaquinasParadas(long maquinasParadas) { this.maquinasParadas = maquinasParadas; }
    public long getOrdensAbertas() { return ordensAbertas; }
    public void setOrdensAbertas(long ordensAbertas) { this.ordensAbertas = ordensAbertas; }
    public long getOrdensConcluidas() { return ordensConcluidas; }
    public void setOrdensConcluidas(long ordensConcluidas) { this.ordensConcluidas = ordensConcluidas; }
    public long getOrdensEmergenciais() { return ordensEmergenciais; }
    public void setOrdensEmergenciais(long ordensEmergenciais) { this.ordensEmergenciais = ordensEmergenciais; }
    public long getAlertasAtivos() { return alertasAtivos; }
    public void setAlertasAtivos(long alertasAtivos) { this.alertasAtivos = alertasAtivos; }
    public BigDecimal getCustoTotalMes() { return custoTotalMes; }
    public void setCustoTotalMes(BigDecimal custoTotalMes) { this.custoTotalMes = custoTotalMes; }
    public BigDecimal getTempoMedioParada() { return tempoMedioParada; }
    public void setTempoMedioParada(BigDecimal tempoMedioParada) { this.tempoMedioParada = tempoMedioParada; }
}
