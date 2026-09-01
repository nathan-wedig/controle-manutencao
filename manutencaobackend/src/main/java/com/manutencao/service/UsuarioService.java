package com.manutencao.service;

import com.manutencao.dto.RegisterRequest;
import com.manutencao.dto.UsuarioResponse;
import com.manutencao.model.Usuario;
import com.manutencao.repository.UsuarioRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UsuarioResponse> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(UsuarioResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public UsuarioResponse buscarPorId(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
        return UsuarioResponse.fromEntity(usuario);
    }

    public UsuarioResponse criar(RegisterRequest request) {
        if (usuarioRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username ja cadastrado");
        }
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email ja cadastrado");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.getUsername());
        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setTelefone(request.getTelefone());
        usuario.setCargo(request.getCargo());
        usuario.setEspecialidade(request.getEspecialidade());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setRole(request.getRole());

        return UsuarioResponse.fromEntity(usuarioRepository.save(usuario));
    }

    public UsuarioResponse atualizar(UUID id, RegisterRequest request) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));

        usuario.setNome(request.getNome());
        usuario.setEmail(request.getEmail());
        usuario.setTelefone(request.getTelefone());
        usuario.setCargo(request.getCargo());
        usuario.setEspecialidade(request.getEspecialidade());
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            usuario.setRole(request.getRole());
        }

        return UsuarioResponse.fromEntity(usuarioRepository.save(usuario));
    }

    public void deletar(UUID id) {
        Usuario usuario = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));
        usuarioRepository.delete(usuario);
    }
}
