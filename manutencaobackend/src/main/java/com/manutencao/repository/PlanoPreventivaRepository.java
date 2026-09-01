package com.manutencao.repository;

import com.manutencao.model.PlanoPreventiva;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface PlanoPreventivaRepository extends JpaRepository<PlanoPreventiva, UUID> {
    List<PlanoPreventiva> findByMaquinaId(UUID maquinaId);

    @Query("SELECT p FROM PlanoPreventiva p WHERE p.ativo = true AND " +
           "p.proximaExecucao BETWEEN :hoje AND :limite")
    List<PlanoPreventiva> findByProximaExecucaoBetween(@Param("hoje") LocalDate hoje,
                                                       @Param("limite") LocalDate limite);

    @Query("SELECT p FROM PlanoPreventiva p WHERE " +
           "(:search IS NULL OR LOWER(p.nome) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(p.maquinaNome) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<PlanoPreventiva> search(@Param("search") String search, Pageable pageable);
}
