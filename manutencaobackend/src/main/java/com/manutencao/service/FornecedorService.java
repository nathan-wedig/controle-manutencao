package com.manutencao.service;

import com.manutencao.dto.FornecedorResponse;
import com.manutencao.model.Fornecedor;
import com.manutencao.repository.FornecedorRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class FornecedorService {

    private final FornecedorRepository fornecedorRepository;

    public FornecedorService(FornecedorRepository fornecedorRepository) {
        this.fornecedorRepository = fornecedorRepository;
    }

    public Page<FornecedorResponse> listarTodos(String search, Pageable pageable) {
        Page<Fornecedor> page = search != null && !search.isEmpty()
                ? fornecedorRepository.search(search, pageable)
                : fornecedorRepository.findAll(pageable);
        return page.map(FornecedorResponse::fromEntity);
    }

    public FornecedorResponse buscarPorId(UUID id) {
        Fornecedor fornecedor = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor nao encontrado"));
        return FornecedorResponse.fromEntity(fornecedor);
    }

    public FornecedorResponse criar(Fornecedor fornecedor) {
        return FornecedorResponse.fromEntity(fornecedorRepository.save(fornecedor));
    }

    public FornecedorResponse atualizar(UUID id, Fornecedor fornecedor) {
        Fornecedor existente = fornecedorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Fornecedor nao encontrado"));
        existente.setNome(fornecedor.getNome());
        existente.setCnpj(fornecedor.getCnpj());
        existente.setNomeRepresentante(fornecedor.getNomeRepresentante());
        existente.setTelefone(fornecedor.getTelefone());
        existente.setEmail(fornecedor.getEmail());
        existente.setTipoServico(fornecedor.getTipoServico());
        existente.setDetalhesServico(fornecedor.getDetalhesServico());
        existente.setWhatsappRepresentante(fornecedor.getWhatsappRepresentante());
        existente.setFormasPagamento(fornecedor.getFormasPagamento());
        return FornecedorResponse.fromEntity(fornecedorRepository.save(existente));
    }

    public void deletar(UUID id) {
        fornecedorRepository.deleteById(id);
    }
}
