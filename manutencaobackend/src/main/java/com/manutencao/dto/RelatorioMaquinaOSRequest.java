package com.manutencao.dto;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public class RelatorioMaquinaOSRequest {

    private List<UUID> maquinaIds;
    private LocalDate inicio;
    private LocalDate fim;

    public List<UUID> getMaquinaIds() { return maquinaIds; }
    public void setMaquinaIds(List<UUID> maquinaIds) { this.maquinaIds = maquinaIds; }
    public LocalDate getInicio() { return inicio; }
    public void setInicio(LocalDate inicio) { this.inicio = inicio; }
    public LocalDate getFim() { return fim; }
    public void setFim(LocalDate fim) { this.fim = fim; }
}
