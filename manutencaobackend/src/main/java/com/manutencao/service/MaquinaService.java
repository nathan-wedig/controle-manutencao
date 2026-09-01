package com.manutencao.service;

import com.manutencao.dto.AnexoResponse;
import com.manutencao.dto.FornecedorResponse;
import com.manutencao.dto.MaquinaResponse;
import com.manutencao.dto.PastaResponse;
import com.manutencao.model.*;
import com.manutencao.model.enums.StatusMaquina;
import com.manutencao.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class MaquinaService {

    private final MaquinaRepository maquinaRepository;
    private final MaquinaFornecedorRepository maquinaFornecedorRepository;
    private final PastaRepository pastaRepository;
    private final AnexoRepository anexoRepository;
    private final FornecedorRepository fornecedorRepository;
    private final OrdemServicoRepository ordemServicoRepository;
    private final UploadService uploadService;

    public MaquinaService(MaquinaRepository maquinaRepository,
                          MaquinaFornecedorRepository maquinaFornecedorRepository,
                          PastaRepository pastaRepository,
                          AnexoRepository anexoRepository,
                          FornecedorRepository fornecedorRepository,
                          OrdemServicoRepository ordemServicoRepository,
                          UploadService uploadService) {
        this.maquinaRepository = maquinaRepository;
        this.maquinaFornecedorRepository = maquinaFornecedorRepository;
        this.pastaRepository = pastaRepository;
        this.anexoRepository = anexoRepository;
        this.fornecedorRepository = fornecedorRepository;
        this.ordemServicoRepository = ordemServicoRepository;
        this.uploadService = uploadService;
    }

    public Page<MaquinaResponse> listarTodas(String search, Pageable pageable) {
        Page<Maquina> page = search != null && !search.isEmpty()
                ? maquinaRepository.search(search, pageable)
                : maquinaRepository.findAll(pageable);
        return page.map(MaquinaResponse::fromEntity);
    }

    public List<MaquinaResponse> listarTodasRelatorio(String search, String setor, StatusMaquina status) {
        List<Maquina> list = maquinaRepository.findAllFiltered(search, setor, status);
        return list.stream().map(MaquinaResponse::fromEntity).collect(Collectors.toList());
    }

    public MaquinaResponse buscarPorId(UUID id) {
        Maquina maquina = maquinaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        MaquinaResponse response = MaquinaResponse.fromEntity(maquina);
        response.setFornecedores(buscarFornecedores(maquina));
        return response;
    }

    public MaquinaResponse buscarPorCodigo(String codigo) {
        Maquina maquina = maquinaRepository.findByCodigoMaquina(codigo)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        MaquinaResponse response = MaquinaResponse.fromEntity(maquina);
        response.setFornecedores(buscarFornecedores(maquina));
        return response;
    }

    public MaquinaResponse buscarPorQrcode(String hash) {
        Maquina maquina = maquinaRepository.findByQrcodeHash(hash)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        MaquinaResponse response = MaquinaResponse.fromEntity(maquina);
        response.setFornecedores(buscarFornecedores(maquina));
        return response;
    }

    @Transactional
    public MaquinaResponse criar(Maquina maquina) {
        if (maquina.getQrcodeHash() == null) {
            maquina.setQrcodeHash(UUID.randomUUID().toString());
        }
        if (maquinaRepository.existsByCodigoMaquina(maquina.getCodigoMaquina())) {
            throw new RuntimeException("Já existe uma máquina ativa cadastrada com este Nº Patrimônio");
        }
        Optional<Maquina> deleted = maquinaRepository.findDeletedByCodigoMaquina(maquina.getCodigoMaquina());
        if (deleted.isPresent()) {
            Maquina existente = deleted.get();
            existente.setAtivo(true);
            existente.setCodigoMaquina(maquina.getCodigoMaquina());
            existente.setApr(maquina.getApr());
            existente.setNr12(maquina.getNr12());
            existente.setNome(maquina.getNome());
            existente.setSetor(maquina.getSetor());
            existente.setFonteEnergia(maquina.getFonteEnergia());
            existente.setNomeOperador(maquina.getNomeOperador());
            existente.setNumeroSerie(maquina.getNumeroSerie());
            existente.setAnoFabricacao(maquina.getAnoFabricacao());
            existente.setFabricante(maquina.getFabricante());
            existente.setCnpjFabricante(maquina.getCnpjFabricante());
            existente.setModelo(maquina.getModelo());
            existente.setPeso(maquina.getPeso());
            existente.setDataCompra(maquina.getDataCompra());
            existente.setDataGarantia(maquina.getDataGarantia());
            existente.setStatus(maquina.getStatus());
            existente.setObservacoes(maquina.getObservacoes());
            existente.setQrcodeHash(maquina.getQrcodeHash());
            Maquina saved = maquinaRepository.save(existente);
            processarFornecedoresRequest(saved, maquina.getFornecedoresRequest());
            return MaquinaResponse.fromEntity(maquinaRepository.findById(saved.getId()).orElse(saved));
        }
        Maquina saved = maquinaRepository.save(maquina);
        if (maquina.getAnexos() != null && !maquina.getAnexos().isEmpty()) {
            associarAnexos(saved.getId(), maquina.getAnexos());
        }
        processarFornecedoresRequest(saved, maquina.getFornecedoresRequest());
        return MaquinaResponse.fromEntity(maquinaRepository.findById(saved.getId()).orElse(saved));
    }

    @Transactional
    public MaquinaResponse atualizar(UUID id, Maquina maquina) {
        Maquina existente = maquinaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        if (!existente.getCodigoMaquina().equals(maquina.getCodigoMaquina())) {
            if (maquinaRepository.existsByCodigoMaquina(maquina.getCodigoMaquina())) {
                throw new RuntimeException("Já existe uma máquina ativa cadastrada com este Nº Patrimônio");
            }
            Optional<Maquina> deleted = maquinaRepository.findDeletedByCodigoMaquina(maquina.getCodigoMaquina());
            if (deleted.isPresent() && !deleted.get().getId().equals(id)) {
                Maquina reativada = deleted.get();
                reativada.setAtivo(true);
                reativada.setCodigoMaquina(maquina.getCodigoMaquina());
                reativada.setApr(maquina.getApr());
                reativada.setNr12(maquina.getNr12());
                reativada.setNome(maquina.getNome());
                reativada.setSetor(maquina.getSetor());
                reativada.setFonteEnergia(maquina.getFonteEnergia());
                reativada.setNomeOperador(maquina.getNomeOperador());
                reativada.setNumeroSerie(maquina.getNumeroSerie());
                reativada.setAnoFabricacao(maquina.getAnoFabricacao());
                reativada.setFabricante(maquina.getFabricante());
                reativada.setCnpjFabricante(maquina.getCnpjFabricante());
                reativada.setModelo(maquina.getModelo());
                reativada.setPeso(maquina.getPeso());
                reativada.setDataCompra(maquina.getDataCompra());
                reativada.setDataGarantia(maquina.getDataGarantia());
                reativada.setStatus(maquina.getStatus());
                reativada.setObservacoes(maquina.getObservacoes());
                Maquina saved = maquinaRepository.save(reativada);
                maquinaRepository.deleteById(id);
                processarFornecedoresRequest(saved, maquina.getFornecedoresRequest());
                return MaquinaResponse.fromEntity(maquinaRepository.findById(saved.getId()).orElse(saved));
            }
        }
        existente.setCodigoMaquina(maquina.getCodigoMaquina());
        existente.setApr(maquina.getApr());
        existente.setNr12(maquina.getNr12());
        existente.setNome(maquina.getNome());
        existente.setSetor(maquina.getSetor());
        existente.setFonteEnergia(maquina.getFonteEnergia());
        existente.setNomeOperador(maquina.getNomeOperador());
        existente.setNumeroSerie(maquina.getNumeroSerie());
        existente.setAnoFabricacao(maquina.getAnoFabricacao());
        existente.setFabricante(maquina.getFabricante());
        existente.setCnpjFabricante(maquina.getCnpjFabricante());
        existente.setModelo(maquina.getModelo());
        existente.setPeso(maquina.getPeso());
        existente.setDataCompra(maquina.getDataCompra());
        existente.setDataGarantia(maquina.getDataGarantia());
        existente.setStatus(maquina.getStatus());
        existente.setObservacoes(maquina.getObservacoes());
        Maquina saved = maquinaRepository.save(existente);

        if (maquina.getAnexos() != null) {
            List<UUID> requestIds = maquina.getAnexos().stream()
                    .map(Anexo::getId)
                    .collect(Collectors.toList());
            List<Anexo> anexosAtuais = anexoRepository.findByMaquinaId(saved.getId());
            for (Anexo a : anexosAtuais) {
                if (!requestIds.contains(a.getId())) {
                    uploadService.deletar(a.getId());
                }
            }
            if (!maquina.getAnexos().isEmpty()) {
                associarAnexos(saved.getId(), maquina.getAnexos());
            }
        }
        processarFornecedoresRequest(saved, maquina.getFornecedoresRequest());

        return MaquinaResponse.fromEntity(maquinaRepository.findById(saved.getId()).orElse(saved));
    }

    @Transactional
    public void associarAnexos(UUID maquinaId, List<Anexo> anexosRequest) {
        if (anexosRequest == null || anexosRequest.isEmpty()) return;
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        List<UUID> ids = anexosRequest.stream().map(Anexo::getId).collect(Collectors.toList());
        List<Anexo> anexos = anexoRepository.findAllById(ids);
        Map<UUID, Anexo> requestMap = anexosRequest.stream()
                .collect(Collectors.toMap(Anexo::getId, a -> a));
        for (Anexo a : anexos) {
            Anexo req = requestMap.get(a.getId());
            if (req != null) {
                a.setCategoria(req.getCategoria());
                if (req.getPasta() != null) {
                    a.setPasta(req.getPasta());
                    a.setPastaNome(req.getPasta() != null && req.getPasta().getNome() != null
                            ? req.getPasta().getNome() : null);
                }
            }
            a.setMaquina(maquina);
        }
        anexoRepository.saveAll(anexos);
    }

    private void processarFornecedoresRequest(Maquina maquina, List<Map<String, Object>> fornecedoresRequest) {
        if (fornecedoresRequest == null) return;
        UUID maquinaId = maquina.getId();
        List<MaquinaFornecedor> existentes = maquinaFornecedorRepository.findByMaquinaId(maquinaId);
        maquinaFornecedorRepository.deleteAll(existentes);
        List<MaquinaFornecedor> novos = new ArrayList<>();
        for (Map<String, Object> f : fornecedoresRequest) {
            Object idObj = f.get("fornecedorId");
            if (idObj == null) continue;
            UUID fornecedorId = UUID.fromString(idObj.toString());
            Fornecedor fornecedor = fornecedorRepository.findById(fornecedorId).orElse(null);
            if (fornecedor == null) continue;
            MaquinaFornecedor mf = new MaquinaFornecedor();
            mf.setMaquina(maquina);
            mf.setFornecedor(fornecedor);
            Object obs = f.get("observacao");
            mf.setObservacao(obs != null ? obs.toString() : null);
            novos.add(mf);
        }
        if (!novos.isEmpty()) {
            maquinaFornecedorRepository.saveAll(novos);
        }
    }

    @Transactional
    public void deletar(UUID id) {
        List<OrdemServico> ordens = ordemServicoRepository.findByMaquinaId(id);
        if (!ordens.isEmpty()) {
            throw new RuntimeException("Não é possível excluir a máquina pois existem ordens de serviço vinculadas a ela.");
        }
        maquinaRepository.deleteById(id);
    }

    public List<FornecedorResponse> listarFornecedores(UUID maquinaId) {
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        return buscarFornecedores(maquina);
    }

    @Transactional
    public void adicionarFornecedor(UUID maquinaId, UUID fornecedorId, String observacao) {
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        Fornecedor fornecedor = fornecedorRepository.findById(fornecedorId)
                .orElseThrow(() -> new RuntimeException("Fornecedor nao encontrado"));

        MaquinaFornecedor mf = new MaquinaFornecedor();
        mf.setMaquina(maquina);
        mf.setFornecedor(fornecedor);
        mf.setObservacao(observacao);
        maquinaFornecedorRepository.save(mf);
    }

    @Transactional
    public void removerFornecedor(UUID maquinaId, UUID fornecedorId) {
        List<MaquinaFornecedor> list = maquinaFornecedorRepository.findByMaquinaId(maquinaId);
        list.stream()
                .filter(mf -> mf.getFornecedor().getId().equals(fornecedorId))
                .findFirst()
                .ifPresent(maquinaFornecedorRepository::delete);
    }

    public List<PastaResponse> listarPastas(UUID maquinaId) {
        return pastaRepository.findByMaquinaId(maquinaId).stream()
                .map(PastaResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PastaResponse criarPasta(UUID maquinaId, String nome, UUID pastaPaiId) {
        Maquina maquina = maquinaRepository.findById(maquinaId)
                .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
        Pasta pasta = new Pasta();
        pasta.setNome(nome);
        pasta.setMaquina(maquina);
        if (pastaPaiId != null) {
            Pasta pastaPai = pastaRepository.findById(pastaPaiId)
                    .orElseThrow(() -> new RuntimeException("Pasta pai nao encontrada"));
            pasta.setPastaPai(pastaPai);
        }
        return PastaResponse.fromEntity(pastaRepository.save(pasta));
    }

    @Transactional
    public void deletarPasta(UUID maquinaId, UUID pastaId) {
        Pasta pasta = pastaRepository.findById(pastaId)
                .orElseThrow(() -> new RuntimeException("Pasta nao encontrada"));
        if (!pasta.getMaquina().getId().equals(maquinaId)) {
            throw new RuntimeException("Pasta nao pertence a esta maquina");
        }
        pastaRepository.delete(pasta);
    }

    @Transactional
    public AnexoResponse moverAnexo(UUID maquinaId, UUID anexoId, UUID pastaId) {
        Anexo anexo = anexoRepository.findById(anexoId)
                .orElseThrow(() -> new RuntimeException("Anexo nao encontrado"));
        if (!anexo.getMaquina().getId().equals(maquinaId)) {
            throw new RuntimeException("Anexo nao pertence a esta maquina");
        }
        if (pastaId != null) {
            Pasta pasta = pastaRepository.findById(pastaId)
                    .orElseThrow(() -> new RuntimeException("Pasta nao encontrada"));
            anexo.setPasta(pasta);
            anexo.setPastaNome(pasta.getNome());
        } else {
            anexo.setPasta(null);
            anexo.setPastaNome(null);
        }
        return AnexoResponse.fromEntity(anexoRepository.save(anexo));
    }

    private List<FornecedorResponse> buscarFornecedores(Maquina maquina) {
        return maquinaFornecedorRepository.findByMaquinaId(maquina.getId()).stream()
                .map(mf -> {
                    FornecedorResponse fr = FornecedorResponse.fromEntity(mf.getFornecedor());
                    fr.setObservacao(mf.getObservacao());
                    return fr;
                })
                .collect(Collectors.toList());
    }
}
