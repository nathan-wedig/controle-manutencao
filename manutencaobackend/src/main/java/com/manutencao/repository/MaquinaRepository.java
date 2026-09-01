package com.manutencao.repository;

import com.manutencao.model.Maquina;
import com.manutencao.model.enums.StatusMaquina;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface MaquinaRepository extends JpaRepository<Maquina, UUID> {
    Optional<Maquina> findByCodigoMaquina(String codigoMaquina);
    Optional<Maquina> findByQrcodeHash(String qrcodeHash);
    List<Maquina> findByStatus(StatusMaquina status);
    long countByStatus(StatusMaquina status);
    @Query("SELECT COUNT(m) > 0 FROM Maquina m WHERE m.codigoMaquina = :codigoMaquina AND m.ativo = true")
    boolean existsByCodigoMaquina(@Param("codigoMaquina") String codigoMaquina);

    @Query(value = "SELECT * FROM maquinas WHERE codigo_maquina = :codigoMaquina AND ativo = false LIMIT 1", nativeQuery = true)
    Optional<Maquina> findDeletedByCodigoMaquina(@Param("codigoMaquina") String codigoMaquina);

    @Query("SELECT m FROM Maquina m WHERE " +
           "(:search IS NULL OR LOWER(m.nome) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.codigoMaquina) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.setor) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.numeroSerie) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.fabricante) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.modelo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.nomeOperador) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.fonteEnergia) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<Maquina> search(@Param("search") String search, Pageable pageable);

    @Query("SELECT m FROM Maquina m WHERE " +
           "(:search IS NULL OR LOWER(m.nome) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.codigoMaquina) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.setor) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.numeroSerie) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.fabricante) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.modelo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.nomeOperador) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(m.fonteEnergia) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:setor IS NULL OR LOWER(m.setor) LIKE LOWER(CONCAT('%', :setor, '%'))) " +
           "AND (:status IS NULL OR m.status = :status)")
    List<Maquina> findAllFiltered(@Param("search") String search,
                                  @Param("setor") String setor,
                                  @Param("status") StatusMaquina status);

    long count();

    List<Maquina> findAllByIdIn(@Param("ids") List<UUID> ids);
}
