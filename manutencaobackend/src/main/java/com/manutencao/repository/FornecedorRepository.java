package com.manutencao.repository;

import com.manutencao.model.Fornecedor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface FornecedorRepository extends JpaRepository<Fornecedor, UUID> {

    @Query("SELECT f FROM Fornecedor f WHERE " +
           "(:q IS NULL OR LOWER(f.nome) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(f.cnpj) LIKE LOWER(CONCAT('%', :q, '%')) " +
           "OR LOWER(f.tipoServico) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Fornecedor> search(@Param("q") String q, Pageable pageable);
}
