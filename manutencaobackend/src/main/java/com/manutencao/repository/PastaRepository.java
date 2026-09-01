package com.manutencao.repository;

import com.manutencao.model.Pasta;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PastaRepository extends JpaRepository<Pasta, UUID> {
    List<Pasta> findByMaquinaId(UUID maquinaId);
    List<Pasta> findByPastaPaiId(UUID pastaPaiId);
}
