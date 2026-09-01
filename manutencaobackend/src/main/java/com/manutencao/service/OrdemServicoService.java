package com.manutencao.service;

import com.manutencao.dto.ItemCustoResponse;
import com.manutencao.dto.OrdemServicoResponse;
import com.manutencao.model.*;
import com.manutencao.model.enums.StatusOrdemServico;
import com.manutencao.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class OrdemServicoService {

    private final OrdemServicoRepository ordemServicoRepository;
    private final MaquinaRepository maquinaRepository;
    private final UsuarioRepository usuarioRepository;
    private final AnexoRepository anexoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final PlanoPreventivaRepository planoPreventivaRepository;

    public OrdemServicoService(OrdemServicoRepository ordemServicoRepository,
                                MaquinaRepository maquinaRepository,
                                UsuarioRepository usuarioRepository,
                                AnexoRepository anexoRepository,
                                FornecedorRepository fornecedorRepository,
                                PlanoPreventivaRepository planoPreventivaRepository) {
        this.ordemServicoRepository = ordemServicoRepository;
        this.maquinaRepository = maquinaRepository;
        this.usuarioRepository = usuarioRepository;
        this.anexoRepository = anexoRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.planoPreventivaRepository = planoPreventivaRepository;
    }

    public Page<OrdemServicoResponse> listarTodas(String search, Pageable pageable) {
        Page<OrdemServico> page = search != null && !search.isEmpty()
                ? ordemServicoRepository.search(search, pageable)
                : ordemServicoRepository.findAll(pageable);
        return page.map(OrdemServicoResponse::fromEntity);
    }

    public OrdemServicoResponse buscarPorId(UUID id) {
        OrdemServico os = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));
        return OrdemServicoResponse.fromEntity(os);
    }

    public List<OrdemServicoResponse> listarPorMaquina(UUID maquinaId) {
        return ordemServicoRepository.findByMaquinaId(maquinaId).stream()
                .map(OrdemServicoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public Page<OrdemServicoResponse> listarPorMaquina(UUID maquinaId, Pageable pageable) {
        return ordemServicoRepository.findByMaquinaId(maquinaId, pageable)
                .map(OrdemServicoResponse::fromEntity);
    }

    public List<OrdemServicoResponse> listarPorTecnico(UUID tecnicoId) {
        return ordemServicoRepository.findByTecnicoResponsavelId(tecnicoId).stream()
                .map(OrdemServicoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<OrdemServicoResponse> listarPorStatus(StatusOrdemServico status) {
        return ordemServicoRepository.findByStatus(status).stream()
                .map(OrdemServicoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public OrdemServicoResponse criar(OrdemServico ordemServico) {
        ordemServico.setNumeroOS(gerarNumeroOS());
        preencherDenormalizados(ordemServico);
        calcularCustoTotal(ordemServico);
        return OrdemServicoResponse.fromEntity(ordemServicoRepository.save(ordemServico));
    }

    @Transactional
    public OrdemServicoResponse atualizar(UUID id, OrdemServico ordemServico) {
        OrdemServico existente = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));

        existente.setTipo(ordemServico.getTipo());
        existente.setPrioridade(ordemServico.getPrioridade());
        existente.setSetor(ordemServico.getSetor());
        existente.setProblemaRelatado(ordemServico.getProblemaRelatado());
        existente.setAcaoFeita(ordemServico.getAcaoFeita());
        existente.setObservacoes(ordemServico.getObservacoes());
        existente.setMaquinaId(ordemServico.getMaquinaId());
        existente.setTecnicoResponsavelId(ordemServico.getTecnicoResponsavelId());
        existente.setDataAbertura(ordemServico.getDataAbertura());
        existente.setDataMaxima(ordemServico.getDataMaxima());
        existente.setDataAgendamento(ordemServico.getDataAgendamento());
        existente.setTempoParadoHoras(ordemServico.getTempoParadoHoras());
        existente.setCustoPecas(ordemServico.getCustoPecas());
        existente.setCustoServico(ordemServico.getCustoServico());
        existente.setFornecedorId(ordemServico.getFornecedorId());
        existente.setFornecedorNome(ordemServico.getFornecedorNome());
        existente.setObservacoesTerceiro(ordemServico.getObservacoesTerceiro());

        if (ordemServico.getItensCusto() != null) {
            existente.getItensCusto().clear();
            for (ItemCusto item : ordemServico.getItensCusto()) {
                item.setOrdemServico(existente);
                existente.getItensCusto().add(item);
            }
        }

        preencherDenormalizados(existente);
        calcularCustoTotal(existente);

        return OrdemServicoResponse.fromEntity(ordemServicoRepository.save(existente));
    }

    @Transactional
    public OrdemServicoResponse iniciar(UUID id) {
        OrdemServico os = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));
        os.setStatus(StatusOrdemServico.EM_ANDAMENTO);
        os.setDataAgendamento(LocalDate.now());
        return OrdemServicoResponse.fromEntity(ordemServicoRepository.save(os));
    }

    @Transactional
    public OrdemServicoResponse concluir(UUID id, String acaoFeita, BigDecimal tempoParadoHoras,
                                          List<ItemCusto> itensCusto, LocalDateTime dataConclusao) {
        OrdemServico os = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));
        os.setStatus(StatusOrdemServico.CONCLUIDA);
        os.setAcaoFeita(acaoFeita);
        os.setTempoParadoHoras(tempoParadoHoras);
        os.setDataConclusao(dataConclusao != null ? dataConclusao : LocalDateTime.now());

        if (itensCusto != null) {
            os.getItensCusto().clear();
            for (ItemCusto item : itensCusto) {
                item.setOrdemServico(os);
                os.getItensCusto().add(item);
            }
        }

        calcularCustoTotal(os);
        OrdemServicoResponse response = OrdemServicoResponse.fromEntity(ordemServicoRepository.save(os));

        if (os.getPlanoPreventivaId() != null) {
            planoPreventivaRepository.findById(os.getPlanoPreventivaId()).ifPresent(plano -> {
                LocalDate dataExecucao = os.getDataConclusao() != null ? os.getDataConclusao().toLocalDate() : LocalDate.now();
                plano.setUltimaExecucao(dataExecucao);
                if (plano.getPeriodicidadeDias() != null) {
                    plano.setProximaExecucao(dataExecucao.plusDays(plano.getPeriodicidadeDias()));
                }
                planoPreventivaRepository.save(plano);
            });
        }

        return response;
    }

    @Transactional
    public OrdemServicoResponse cancelar(UUID id) {
        OrdemServico os = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));
        os.setStatus(StatusOrdemServico.CANCELADA);
        return OrdemServicoResponse.fromEntity(ordemServicoRepository.save(os));
    }

    @Transactional
    public void adicionarAnexo(UUID id, UUID anexoId) {
        OrdemServico os = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));
        Anexo anexo = anexoRepository.findById(anexoId)
                .orElseThrow(() -> new RuntimeException("Anexo nao encontrado"));
        os.getAnexos().add(anexo);
        ordemServicoRepository.save(os);
    }

    @Transactional
    public void removerAnexo(UUID id, UUID anexoId) {
        OrdemServico os = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));
        Anexo anexo = anexoRepository.findById(anexoId)
                .orElseThrow(() -> new RuntimeException("Anexo nao encontrado"));
        os.getAnexos().remove(anexo);
        ordemServicoRepository.save(os);
    }

    @Transactional
    public void deletar(UUID id) {
        OrdemServico os = ordemServicoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordem de servico nao encontrada"));
        os.getAnexos().clear();
        os.getItensCusto().clear();
        ordemServicoRepository.delete(os);
    }

    private String gerarNumeroOS() {
        String prefix = "OS-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd")) + "-";
        String ultimo = ordemServicoRepository.findLastNumeroOSByPrefix(prefix + "%");
        int sequencial = 1;
        if (ultimo != null) {
            String seqStr = ultimo.substring(ultimo.lastIndexOf("-") + 1);
            try {
                sequencial = Integer.parseInt(seqStr) + 1;
            } catch (NumberFormatException e) {
                sequencial = 1;
            }
        }
        return prefix + String.format("%04d", sequencial);
    }

    private void preencherDenormalizados(OrdemServico os) {
        if (os.getMaquinaId() != null) {
            maquinaRepository.findById(os.getMaquinaId()).ifPresent(m -> {
                os.setMaquinaNome(m.getNome());
                os.setMaquinaCodigo(m.getCodigoMaquina());
            });
        }
        if (os.getTecnicoResponsavelId() != null) {
            usuarioRepository.findById(os.getTecnicoResponsavelId()).ifPresent(u -> {
                os.setTecnicoNome(u.getNome());
            });
        }
        if (os.getFornecedorId() != null) {
            fornecedorRepository.findById(os.getFornecedorId()).ifPresent(f -> {
                os.setFornecedorNome(f.getNome());
            });
        }
        if (os.getItensCusto() != null) {
            for (ItemCusto item : os.getItensCusto()) {
                item.setOrdemServico(os);
            }
        }
    }

    private void calcularCustoTotal(OrdemServico os) {
        BigDecimal total = BigDecimal.ZERO;
        if (os.getCustoPecas() != null) total = total.add(os.getCustoPecas());
        if (os.getCustoServico() != null) total = total.add(os.getCustoServico());
        if (os.getItensCusto() != null) {
            for (ItemCusto item : os.getItensCusto()) {
                if (item.getValorUnitario() != null && item.getUnidade() != null) {
                    total = total.add(item.getValorUnitario().multiply(BigDecimal.valueOf(item.getUnidade())));
                } else if (item.getValorUnitario() != null) {
                    total = total.add(item.getValorUnitario());
                }
            }
        }
        os.setCustoTotal(total);
    }
}
