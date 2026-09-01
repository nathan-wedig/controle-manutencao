package com.manutencao.repository;

import com.manutencao.model.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, UUID> {
}
