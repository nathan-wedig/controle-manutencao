package com.manutencao.service;

import com.manutencao.dto.PlanoPreventivaResponse;
import com.manutencao.model.PlanoPreventiva;
import com.manutencao.repository.MaquinaRepository;
import com.manutencao.repository.PlanoPreventivaRepository;
import com.manutencao.repository.UsuarioRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PlanoPreventivaService {

    private final PlanoPreventivaRepository planoPreventivaRepository;
    private final MaquinaRepository maquinaRepository;
    private final UsuarioRepository usuarioRepository;

    public PlanoPreventivaService(PlanoPreventivaRepository planoPreventivaRepository,
                                  MaquinaRepository maquinaRepository,
                                  UsuarioRepository usuarioRepository) {
        this.planoPreventivaRepository = planoPreventivaRepository;
        this.maquinaRepository = maquinaRepository;
        this.usuarioRepository = usuarioRepository;
    }

    public Page<PlanoPreventivaResponse> listarTodos(String search, Pageable pageable) {
        Page<PlanoPreventiva> page = search != null && !search.isEmpty()
                ? planoPreventivaRepository.search(search, pageable)
                : planoPreventivaRepository.findAll(pageable);
        return page.map(PlanoPreventivaResponse::fromEntity);
    }

    public PlanoPreventivaResponse buscarPorId(UUID id) {
        PlanoPreventiva plano = planoPreventivaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plano de preventiva nao encontrado"));
        return PlanoPreventivaResponse.fromEntity(plano);
    }

    public List<PlanoPreventivaResponse> listarPorMaquina(UUID maquinaId) {
        return planoPreventivaRepository.findByMaquinaId(maquinaId).stream()
                .map(PlanoPreventivaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public List<PlanoPreventivaResponse> listarProximos(Integer dias) {
        LocalDate hoje = LocalDate.now();
        LocalDate limite = hoje.plusDays(dias);
        return planoPreventivaRepository.findByProximaExecucaoBetween(hoje, limite).stream()
                .map(PlanoPreventivaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PlanoPreventivaResponse criar(PlanoPreventiva plano) {
        preencherDenormalizados(plano);
        if (plano.getProximaExecucao() == null) {
            if (plano.getUltimaExecucao() != null && plano.getPeriodicidadeDias() != null) {
                plano.setProximaExecucao(plano.getUltimaExecucao().plusDays(plano.getPeriodicidadeDias()));
            } else {
                plano.setProximaExecucao(LocalDate.now());
            }
        }
        return PlanoPreventivaResponse.fromEntity(planoPreventivaRepository.save(plano));
    }

    @Transactional
    public PlanoPreventivaResponse atualizar(UUID id, PlanoPreventiva plano) {
        PlanoPreventiva existente = planoPreventivaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plano de preventiva nao encontrado"));

        existente.setNome(plano.getNome());
        existente.setDescricao(plano.getDescricao());
        existente.setPeriodicidadeDias(plano.getPeriodicidadeDias());
        existente.setMaquinaId(plano.getMaquinaId());
        existente.setResponsavelId(plano.getResponsavelId());
        if (plano.getUltimaExecucao() != null) {
            existente.setUltimaExecucao(plano.getUltimaExecucao());
        }
        if (plano.getProximaExecucao() == null) {
            if (plano.getUltimaExecucao() != null && plano.getPeriodicidadeDias() != null) {
                existente.setProximaExecucao(plano.getUltimaExecucao().plusDays(plano.getPeriodicidadeDias()));
            }
        } else {
            existente.setProximaExecucao(plano.getProximaExecucao());
        }

        if (plano.getChecklistItens() != null) {
            existente.getChecklistItens().clear();
            plano.getChecklistItens().forEach(item -> {
                item.setPlanoPreventiva(existente);
                existente.getChecklistItens().add(item);
            });
        }

        preencherDenormalizados(existente);
        return PlanoPreventivaResponse.fromEntity(planoPreventivaRepository.save(existente));
    }

    @Transactional
    public PlanoPreventivaResponse executar(UUID id) {
        PlanoPreventiva plano = planoPreventivaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plano de preventiva nao encontrado"));
        plano.setUltimaExecucao(LocalDate.now());
        if (plano.getPeriodicidadeDias() != null) {
            plano.setProximaExecucao(LocalDate.now().plusDays(plano.getPeriodicidadeDias()));
        }
        return PlanoPreventivaResponse.fromEntity(planoPreventivaRepository.save(plano));
    }

    @Transactional
    public void deletar(UUID id) {
        planoPreventivaRepository.deleteById(id);
    }

    private void preencherDenormalizados(PlanoPreventiva plano) {
        if (plano.getMaquinaId() != null) {
            maquinaRepository.findById(plano.getMaquinaId()).ifPresent(m ->
                    plano.setMaquinaNome(m.getNome()));
        }
        if (plano.getResponsavelId() != null) {
            usuarioRepository.findById(plano.getResponsavelId()).ifPresent(u ->
                    plano.setResponsavelNome(u.getNome()));
        }
    }
}
