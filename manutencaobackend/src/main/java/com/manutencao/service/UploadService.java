package com.manutencao.service;

import com.manutencao.dto.AnexoResponse;
import com.manutencao.model.Anexo;
import com.manutencao.model.Maquina;
import com.manutencao.repository.AnexoRepository;
import com.manutencao.repository.MaquinaRepository;
import com.manutencao.repository.OrdemServicoRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class UploadService {

    private final Path uploadDir;
    private final AnexoRepository anexoRepository;
    private final MaquinaRepository maquinaRepository;
    private final OrdemServicoRepository ordemServicoRepository;

    public UploadService(@Value("${app.upload.dir:uploads}") String uploadDirPath,
                         AnexoRepository anexoRepository,
                         MaquinaRepository maquinaRepository,
                         OrdemServicoRepository ordemServicoRepository) {
        this.uploadDir = Paths.get(uploadDirPath).toAbsolutePath().normalize();
        this.anexoRepository = anexoRepository;
        this.maquinaRepository = maquinaRepository;
        this.ordemServicoRepository = ordemServicoRepository;
        try {
            Files.createDirectories(this.uploadDir);
        } catch (IOException e) {
            throw new RuntimeException("Nao foi possivel criar o diretorio de upload: " + uploadDirPath);
        }
    }

    @Transactional
    public AnexoResponse upload(MultipartFile file, String categoria, UUID maquinaId) {
        String nomeOriginal = file.getOriginalFilename();
        String extensao = "";
        if (nomeOriginal != null && nomeOriginal.contains(".")) {
            extensao = nomeOriginal.substring(nomeOriginal.lastIndexOf("."));
        }

        String nomeArquivo = UUID.randomUUID().toString() + extensao;
        Path targetPath = uploadDir.resolve(nomeArquivo);

        try {
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            throw new RuntimeException("Erro ao salvar arquivo: " + e.getMessage());
        }

        Anexo anexo = new Anexo();
        anexo.setNomeOriginal(nomeOriginal);
        anexo.setTipo(file.getContentType());
        anexo.setExtensao(extensao);
        anexo.setTamanho(file.getSize());
        anexo.setCategoria(categoria);
        anexo.setUrl("/uploads/" + nomeArquivo);

        if (maquinaId != null) {
            Maquina maquina = maquinaRepository.findById(maquinaId)
                    .orElseThrow(() -> new RuntimeException("Maquina nao encontrada"));
            anexo.setMaquina(maquina);
        }

        return AnexoResponse.fromEntity(anexoRepository.save(anexo));
    }

    @Transactional
    public void deletar(UUID id) {
        Anexo anexo = anexoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Anexo nao encontrado"));

        ordemServicoRepository.desassociarAnexoDeTodasOs(id);

        if (anexo.getMaquina() != null) {
            anexo.getMaquina().getAnexos().remove(anexo);
        }

        String nomeArquivo = anexo.getUrl().replace("/uploads/", "");
        try {
            Files.deleteIfExists(uploadDir.resolve(nomeArquivo));
        } catch (IOException e) {
            // ignore file deletion error
        }

        anexoRepository.delete(anexo);
    }

    public Path getUploadPath(String nomeArquivo) {
        Path filePath = uploadDir.resolve(nomeArquivo).normalize();
        if (!Files.exists(filePath)) {
            throw new RuntimeException("Arquivo nao encontrado: " + nomeArquivo);
        }
        return filePath;
    }
}
