package com.manutencao.repository;

import com.manutencao.model.OrdemServico;
import com.manutencao.model.enums.StatusOrdemServico;
import com.manutencao.model.enums.TipoOrdemServico;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrdemServicoRepository extends JpaRepository<OrdemServico, UUID> {
    Optional<OrdemServico> findByNumeroOS(String numeroOS);

    @Query("SELECT MAX(o.numeroOS) FROM OrdemServico o WHERE o.numeroOS LIKE :prefix")
    String findLastNumeroOSByPrefix(@Param("prefix") String prefix);

    List<OrdemServico> findByMaquinaId(UUID maquinaId);
    Page<OrdemServico> findByMaquinaId(UUID maquinaId, Pageable pageable);
    List<OrdemServico> findByTecnicoResponsavelId(UUID tecnicoId);
    List<OrdemServico> findByStatus(StatusOrdemServico status);
    long countByStatus(StatusOrdemServico status);
    long countByTipo(TipoOrdemServico tipo);

    @Query("SELECT o FROM OrdemServico o WHERE " +
           "(:search IS NULL OR LOWER(o.numeroOS) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(o.maquinaNome) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(o.tecnicoNome) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<OrdemServico> search(@Param("search") String search, Pageable pageable);

    @Query("SELECT COALESCE(SUM(o.custoTotal), 0) FROM OrdemServico o WHERE " +
           "o.dataConclusao BETWEEN :inicio AND :fim AND o.status = 'CONCLUIDA'")
    BigDecimal sumCustoTotalByPeriodo(@Param("inicio") LocalDateTime inicio,
                                       @Param("fim") LocalDateTime fim);

    @Query("SELECT COUNT(o) FROM OrdemServico o WHERE " +
           "o.dataAbertura BETWEEN :inicio AND :fim")
    long countByDataAberturaBetween(@Param("inicio") LocalDateTime inicio,
                                    @Param("fim") LocalDateTime fim);

    @Query("SELECT o FROM OrdemServico o WHERE " +
           "o.dataConclusao BETWEEN :inicio AND :fim AND o.status = 'CONCLUIDA'")
    List<OrdemServico> findConcluidasByPeriodo(@Param("inicio") LocalDateTime inicio,
                                                @Param("fim") LocalDateTime fim);

    @Query("SELECT o FROM OrdemServico o WHERE o.maquinaId = :maquinaId AND " +
           "o.dataAbertura BETWEEN :inicio AND :fim")
    List<OrdemServico> findByMaquinaIdAndPeriodo(@Param("maquinaId") UUID maquinaId,
                                                  @Param("inicio") LocalDateTime inicio,
                                                  @Param("fim") LocalDateTime fim);

    @Query("SELECT o FROM OrdemServico o WHERE LOWER(o.setor) = LOWER(:setor) AND " +
           "o.dataAbertura BETWEEN :inicio AND :fim")
    List<OrdemServico> findBySetorAndPeriodo(@Param("setor") String setor,
                                              @Param("inicio") LocalDateTime inicio,
                                              @Param("fim") LocalDateTime fim);

    @Query("SELECT AVG(o.tempoParadoHoras) FROM OrdemServico o WHERE o.status = 'CONCLUIDA' " +
           "AND o.dataConclusao BETWEEN :inicio AND :fim")
    BigDecimal avgTempoParadoByPeriodo(@Param("inicio") LocalDateTime inicio,
                                       @Param("fim") LocalDateTime fim);

    @Query("SELECT o FROM OrdemServico o WHERE o.maquinaId IN :maquinaIds " +
           "AND o.dataAbertura BETWEEN :inicio AND :fim ORDER BY o.maquinaId, o.dataAbertura")
    List<OrdemServico> findByMaquinaIdsAndPeriodo(@Param("maquinaIds") List<UUID> maquinaIds,
                                                   @Param("inicio") LocalDateTime inicio,
                                                   @Param("fim") LocalDateTime fim);

    @Modifying
    @Query(value = "DELETE FROM os_anexos WHERE anexo_id = :anexoId", nativeQuery = true)
    void desassociarAnexoDeTodasOs(@Param("anexoId") UUID anexoId);
}
