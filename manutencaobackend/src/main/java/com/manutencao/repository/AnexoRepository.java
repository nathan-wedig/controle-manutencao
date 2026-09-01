package com.manutencao.repository;

import com.manutencao.model.Anexo;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface AnexoRepository extends JpaRepository<Anexo, UUID> {
    List<Anexo> findByMaquinaId(UUID maquinaId);
    List<Anexo> findByPastaId(UUID pastaId);
}
