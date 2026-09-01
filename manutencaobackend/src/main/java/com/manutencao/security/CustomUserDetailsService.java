package com.manutencao.security;

import com.manutencao.model.Usuario;
import com.manutencao.repository.UsuarioRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.List;
import java.util.UUID;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public CustomUserDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Usuario usuario = usuarioRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Usuário não encontrado: " + username));
        return new UserDetailsImpl(usuario);
    }

    public static class UserDetailsImpl implements UserDetails {

        private final UUID id;
        private final String username;
        private final String nome;
        private final String email;
        private final String cargo;
        private final String role;
        private final String password;
        private final boolean ativo;
        private final Collection<? extends GrantedAuthority> authorities;

        public UserDetailsImpl(Usuario usuario) {
            this.id = usuario.getId();
            this.username = usuario.getUsername();
            this.nome = usuario.getNome();
            this.email = usuario.getEmail();
            this.cargo = usuario.getCargo();
            this.role = usuario.getRole().name();
            this.password = usuario.getPassword();
            this.ativo = usuario.isAtivo();
            this.authorities = List.of(new SimpleGrantedAuthority("ROLE_" + usuario.getRole().name()));
        }

        public UUID getId() { return id; }
        public String getNome() { return nome; }
        public String getEmail() { return email; }
        public String getCargo() { return cargo; }
        public String getRole() { return role; }

        @Override
        public Collection<? extends GrantedAuthority> getAuthorities() { return authorities; }

        @Override
        public String getPassword() { return password; }

        @Override
        public String getUsername() { return username; }

        @Override
        public boolean isAccountNonExpired() { return true; }

        @Override
        public boolean isAccountNonLocked() { return true; }

        @Override
        public boolean isCredentialsNonExpired() { return true; }

        @Override
        public boolean isEnabled() { return ativo; }
    }
}
