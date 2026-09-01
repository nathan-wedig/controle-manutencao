package com.manutencao.dto;

import com.manutencao.model.Usuario;
import com.manutencao.model.enums.Role;

import java.util.UUID;

public class UsuarioResponse {

    private UUID id;
    private String username;
    private String nome;
    private String email;
    private String telefone;
    private String cargo;
    private String especialidade;
    private Role role;
    private boolean ativo;

    public static UsuarioResponse fromEntity(Usuario u) {
        UsuarioResponse r = new UsuarioResponse();
        r.setId(u.getId());
        r.setUsername(u.getUsername());
        r.setNome(u.getNome());
        r.setEmail(u.getEmail());
        r.setTelefone(u.getTelefone());
        r.setCargo(u.getCargo());
        r.setEspecialidade(u.getEspecialidade());
        r.setRole(u.getRole());
        r.setAtivo(u.isAtivo());
        return r;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getTelefone() { return telefone; }
    public void setTelefone(String telefone) { this.telefone = telefone; }
    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    public String getEspecialidade() { return especialidade; }
    public void setEspecialidade(String especialidade) { this.especialidade = especialidade; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public boolean isAtivo() { return ativo; }
    public void setAtivo(boolean ativo) { this.ativo = ativo; }
}
