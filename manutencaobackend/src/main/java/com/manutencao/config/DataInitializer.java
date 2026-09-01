package com.manutencao.config;

import com.manutencao.model.Usuario;
import com.manutencao.model.enums.Role;
import com.manutencao.repository.UsuarioRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        if (!usuarioRepository.existsByUsername("admin")) {
            String senhaAdmin = System.getenv("APP_ADMIN_PASSWORD");
            if (senhaAdmin == null || senhaAdmin.isBlank()) {
                senhaAdmin = "admin123";
            }
            Usuario admin = new Usuario();
            admin.setUsername("admin");
            admin.setNome("Administrador");
            admin.setEmail("admin@manutencao.com");
            admin.setPassword(passwordEncoder.encode(senhaAdmin));
            admin.setRole(Role.ADMIN);
            admin.setCargo("Administrador do Sistema");
            usuarioRepository.save(admin);
            System.out.println("Usuario admin criado com sucesso!");
        }
    }
}
