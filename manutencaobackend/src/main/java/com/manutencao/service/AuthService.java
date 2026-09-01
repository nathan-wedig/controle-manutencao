package com.manutencao.service;

import com.manutencao.dto.JwtResponse;
import com.manutencao.dto.LoginRequest;
import com.manutencao.dto.RegisterRequest;
import com.manutencao.model.Usuario;
import com.manutencao.model.enums.Role;
import com.manutencao.repository.UsuarioRepository;
import com.manutencao.security.CustomUserDetailsService;
import com.manutencao.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final CustomUserDetailsService customUserDetailsService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PasswordEncoder passwordEncoder,
                       AuthenticationManager authenticationManager,
                       JwtTokenProvider jwtTokenProvider,
                       CustomUserDetailsService customUserDetailsService) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.customUserDetailsService = customUserDetailsService;
    }

    public JwtResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        var userDetails = (CustomUserDetailsService.UserDetailsImpl)
                customUserDetailsService.loadUserByUsername(request.getUsername());

        String token = jwtTokenProvider.generateToken(userDetails);

        return new JwtResponse(token, userDetails.getId(), userDetails.getUsername(),
                userDetails.getNome(), userDetails.getEmail(), userDetails.getCargo(),
                userDetails.getRole());
    }

    public JwtResponse register(RegisterRequest request) {
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
        usuario.setRole(request.getRole() != null ? request.getRole() : Role.USER);

        usuarioRepository.save(usuario);

        var userDetails = (CustomUserDetailsService.UserDetailsImpl)
                customUserDetailsService.loadUserByUsername(usuario.getUsername());

        String token = jwtTokenProvider.generateToken(userDetails);

        return new JwtResponse(token, userDetails.getId(), userDetails.getUsername(),
                userDetails.getNome(), userDetails.getEmail(), userDetails.getCargo(),
                userDetails.getRole());
    }
}
