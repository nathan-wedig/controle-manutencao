package com.manutencao.repository;

import com.manutencao.model.MaquinaFornecedor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface MaquinaFornecedorRepository extends JpaRepository<MaquinaFornecedor, UUID> {
    List<MaquinaFornecedor> findByMaquinaId(UUID maquinaId);
    List<MaquinaFornecedor> findByFornecedorId(UUID fornecedorId);
}
