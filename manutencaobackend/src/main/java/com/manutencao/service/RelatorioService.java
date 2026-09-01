package com.manutencao.service;

import com.manutencao.dto.RelatorioResponse;
import com.manutencao.model.Maquina;
import com.manutencao.model.OrdemServico;
import com.manutencao.repository.MaquinaRepository;
import com.manutencao.repository.OrdemServicoRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RelatorioService {

    private final OrdemServicoRepository ordemServicoRepository;
    private final MaquinaRepository maquinaRepository;

    public RelatorioService(OrdemServicoRepository ordemServicoRepository,
                            MaquinaRepository maquinaRepository) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.maquinaRepository = maquinaRepository;
    }

    public RelatorioResponse gerarDashboard(LocalDate inicio, LocalDate fim) {
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime fimDt = fim.atTime(LocalTime.MAX);

        RelatorioResponse r = new RelatorioResponse();

        BigDecimal custoTotal = ordemServicoRepository.sumCustoTotalByPeriodo(inicioDt, fimDt);
        r.setCustoTotalPeriodo(custoTotal);

        long totalOS = ordemServicoRepository.countByDataAberturaBetween(inicioDt, fimDt);
        r.setTotalOSPeriodo(totalOS);

        if (totalOS > 0) {
            r.setCustoMedioOS(custoTotal.divide(BigDecimal.valueOf(totalOS), 2, RoundingMode.HALF_UP));
        } else {
            r.setCustoMedioOS(BigDecimal.ZERO);
        }

        List<OrdemServico> concluidas = ordemServicoRepository.findConcluidasByPeriodo(inicioDt, fimDt);

        // Agrupar por mes
        Map<String, RelatorioResponse.MesRelatorio> mesesMap = new LinkedHashMap<>();
        for (OrdemServico os : concluidas) {
            if (os.getDataConclusao() == null) continue;
            int mes = os.getDataConclusao().getMonthValue();
            int ano = os.getDataConclusao().getYear();
            String key = ano + "-" + mes;
            RelatorioResponse.MesRelatorio mr = mesesMap.getOrDefault(key, new RelatorioResponse.MesRelatorio());
            if (mr.getAno() == 0) {
                mr.setMes(mes);
                mr.setAno(ano);
                mr.setQuantidadeOS(0);
                mr.setCustoTotal(BigDecimal.ZERO);
            }
            mr.setQuantidadeOS(mr.getQuantidadeOS() + 1);
            if (os.getCustoTotal() != null) {
                mr.setCustoTotal(mr.getCustoTotal().add(os.getCustoTotal()));
            }
            mesesMap.put(key, mr);
        }
        r.setMeses(new ArrayList<>(mesesMap.values()));

        // Top maquinas por OS
        Map<UUID, RelatorioResponse.MaquinaRelatorio> maqOSMap = new LinkedHashMap<>();
        for (OrdemServico os : concluidas) {
            UUID maqId = os.getMaquinaId();
            if (maqId == null) continue;
            RelatorioResponse.MaquinaRelatorio mr = maqOSMap.getOrDefault(maqId, new RelatorioResponse.MaquinaRelatorio());
            if (mr.getMaquinaId() == null) {
                mr.setMaquinaId(maqId);
                mr.setMaquinaNome(os.getMaquinaNome());
                mr.setMaquinaCodigo(os.getMaquinaCodigo());
                mr.setQuantidadeOS(0);
                mr.setCustoTotal(BigDecimal.ZERO);
            }
            mr.setQuantidadeOS(mr.getQuantidadeOS() + 1);
            if (os.getCustoTotal() != null) {
                mr.setCustoTotal(mr.getCustoTotal().add(os.getCustoTotal()));
            }
            maqOSMap.put(maqId, mr);
        }
        r.setTopMaquinasOS(maqOSMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getQuantidadeOS(), a.getQuantidadeOS()))
                .limit(10)
                .collect(Collectors.toList()));

        // Top maquinas por custo
        r.setTopMaquinasCusto(maqOSMap.values().stream()
                .sorted((a, b) -> b.getCustoTotal().compareTo(a.getCustoTotal()))
                .limit(10)
                .collect(Collectors.toList()));

        // Top setores por OS
        Map<String, RelatorioResponse.SetorRelatorio> setorOSMap = new LinkedHashMap<>();
        for (OrdemServico os : concluidas) {
            String setor = os.getSetor();
            if (setor == null) continue;
            RelatorioResponse.SetorRelatorio sr = setorOSMap.getOrDefault(setor, new RelatorioResponse.SetorRelatorio());
            if (sr.getSetor() == null) {
                sr.setSetor(setor);
                sr.setQuantidadeOS(0);
                sr.setCustoTotal(BigDecimal.ZERO);
            }
            sr.setQuantidadeOS(sr.getQuantidadeOS() + 1);
            if (os.getCustoTotal() != null) {
                sr.setCustoTotal(sr.getCustoTotal().add(os.getCustoTotal()));
            }
            setorOSMap.put(setor, sr);
        }
        r.setTopSetoresOS(setorOSMap.values().stream()
                .sorted((a, b) -> Long.compare(b.getQuantidadeOS(), a.getQuantidadeOS()))
                .limit(10)
                .collect(Collectors.toList()));

        r.setTopSetoresCusto(setorOSMap.values().stream()
                .sorted((a, b) -> b.getCustoTotal().compareTo(a.getCustoTotal()))
                .limit(10)
                .collect(Collectors.toList()));

        return r;
    }

    public List<OrdemServico> listarPorMaquinaPeriodo(UUID maquinaId, LocalDate inicio, LocalDate fim) {
        return ordemServicoRepository.findByMaquinaIdAndPeriodo(
                maquinaId, inicio.atStartOfDay(), fim.atTime(LocalTime.MAX));
    }

    public List<OrdemServico> listarPorSetorPeriodo(String setor, LocalDate inicio, LocalDate fim) {
        return ordemServicoRepository.findBySetorAndPeriodo(
                setor, inicio.atStartOfDay(), fim.atTime(LocalTime.MAX));
    }

    public List<RelatorioResponse.RelatorioMaquinaOSResponse> gerarRelatorioMaquinas(List<UUID> maquinaIds, LocalDate inicio, LocalDate fim) {
        LocalDateTime inicioDt = inicio.atStartOfDay();
        LocalDateTime fimDt = fim.atTime(LocalTime.MAX);

        List<OrdemServico> osList = ordemServicoRepository.findByMaquinaIdsAndPeriodo(maquinaIds, inicioDt, fimDt);

        List<Maquina> maquinas = maquinaRepository.findAllByIdIn(maquinaIds);
        Map<UUID, Maquina> maquinaMap = maquinas.stream()
                .collect(Collectors.toMap(Maquina::getId, m -> m));

        Map<UUID, RelatorioResponse.RelatorioMaquinaOSResponse> mapa = new LinkedHashMap<>();

        for (UUID maqId : maquinaIds) {
            RelatorioResponse.RelatorioMaquinaOSResponse resp = new RelatorioResponse.RelatorioMaquinaOSResponse();
            resp.setMaquinaId(maqId);
            Maquina m = maquinaMap.get(maqId);
            if (m != null) {
                resp.setCodigoMaquina(m.getCodigoMaquina());
                resp.setNome(m.getNome());
                resp.setApr(m.getApr());
                resp.setNr12(m.getNr12());
                resp.setFabricante(m.getFabricante());
                resp.setModelo(m.getModelo());
                resp.setSetor(m.getSetor());
                resp.setNumeroSerie(m.getNumeroSerie());
                resp.setAnoFabricacao(m.getAnoFabricacao());
            }
            resp.setOrdensServico(new ArrayList<>());
            mapa.put(maqId, resp);
        }

        for (OrdemServico os : osList) {
            UUID maqId = os.getMaquinaId();
            if (maqId == null) continue;

            RelatorioResponse.RelatorioMaquinaOSResponse resp = mapa.get(maqId);
            if (resp == null) continue;

            RelatorioResponse.OSItemRelatorio item = new RelatorioResponse.OSItemRelatorio();
            item.setNumeroOS(os.getNumeroOS());
            item.setDataAbertura(os.getDataAbertura());
            item.setDataConclusao(os.getDataConclusao());
            item.setProblemaRelatado(os.getProblemaRelatado());
            item.setAcaoFeita(os.getAcaoFeita());
            item.setStatus(os.getStatus() != null ? os.getStatus().name() : null);
            item.setTecnicoNome(os.getTecnicoNome());
            resp.getOrdensServico().add(item);
        }

        return new ArrayList<>(mapa.values());
    }
}
