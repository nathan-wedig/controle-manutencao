package com.manutencao.repository;

import com.manutencao.model.Setor;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface SetorRepository extends JpaRepository<Setor, UUID> {
    Optional<Setor> findByNome(String nome);
    boolean existsByNome(String nome);
}
