package com.manutencao.service;

import com.manutencao.model.Setor;
import com.manutencao.repository.SetorRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class SetorService {

    private final SetorRepository setorRepository;

    public SetorService(SetorRepository setorRepository) {
        this.setorRepository = setorRepository;
    }

    public List<Setor> listarTodos() {
        return setorRepository.findAll();
    }

    public Setor buscarPorId(UUID id) {
        return setorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Setor nao encontrado"));
    }

    public Setor criar(Setor setor) {
        if (setorRepository.existsByNome(setor.getNome())) {
            throw new RuntimeException("Setor ja cadastrado");
        }
        return setorRepository.save(setor);
    }

    public Setor atualizar(UUID id, Setor setor) {
        Setor existente = setorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Setor nao encontrado"));
        existente.setNome(setor.getNome());
        existente.setDescricao(setor.getDescricao());
        return setorRepository.save(existente);
    }

    public void deletar(UUID id) {
        Setor setor = setorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Setor nao encontrado"));
        setorRepository.delete(setor);
    }
}
