package com.manutencao.repository;

import com.manutencao.model.ItemCusto;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ItemCustoRepository extends JpaRepository<ItemCusto, UUID> {
}
