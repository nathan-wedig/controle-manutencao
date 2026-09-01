package com.manutencao.service;

import com.manutencao.dto.DashboardResponse;
import com.manutencao.model.enums.StatusMaquina;
import com.manutencao.model.enums.StatusOrdemServico;
import com.manutencao.model.enums.TipoOrdemServico;
import com.manutencao.repository.MaquinaRepository;
import com.manutencao.repository.OrdemServicoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Service
public class DashboardService {

    private final MaquinaRepository maquinaRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    public DashboardService(MaquinaRepository maquinaRepository,
                            OrdemServicoRepository ordemServicoRepository) {
        this.maquinaRepository = maquinaRepository;
        this.ordemServicoRepository = ordemServicoRepository;
    }

    public DashboardResponse obterDashboard() {
        DashboardResponse d = new DashboardResponse();
        d.setTotalMaquinas(maquinaRepository.count());
        d.setMaquinasAtivas(maquinaRepository.countByStatus(StatusMaquina.ATIVA));
        d.setMaquinasEmManutencao(maquinaRepository.countByStatus(StatusMaquina.EM_MANUTENCAO));
        d.setMaquinasParadas(maquinaRepository.countByStatus(StatusMaquina.PARADA));
        d.setOrdensAbertas(ordemServicoRepository.countByStatus(StatusOrdemServico.ABERTA));
        d.setOrdensConcluidas(ordemServicoRepository.countByStatus(StatusOrdemServico.CONCLUIDA));
        d.setOrdensEmergenciais(ordemServicoRepository.countByTipo(TipoOrdemServico.EMERGENCIAL));
        d.setAlertasAtivos(ordemServicoRepository.countByStatus(StatusOrdemServico.AGUARDANDO_APROVACAO));

        LocalDateTime inicioMes = LocalDate.now().withDayOfMonth(1).atStartOfDay();
        LocalDateTime fimMes = LocalDate.now().atTime(LocalTime.MAX);

        d.setCustoTotalMes(ordemServicoRepository.sumCustoTotalByPeriodo(inicioMes, fimMes));

        BigDecimal tempoMedio = ordemServicoRepository.avgTempoParadoByPeriodo(inicioMes, fimMes);
        d.setTempoMedioParada(tempoMedio != null ? tempoMedio : BigDecimal.ZERO);

        return d;
    }
}
