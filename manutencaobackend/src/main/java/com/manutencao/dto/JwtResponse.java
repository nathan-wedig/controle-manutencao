package com.manutencao.dto;

import java.util.UUID;

public class JwtResponse {

    private String token;
    private String tipo = "Bearer";
    private UUID id;
    private String username;
    private String nome;
    private String email;
    private String cargo;
    private String role;

    public JwtResponse() {}

    public JwtResponse(String token, UUID id, String username, String nome,
                       String email, String cargo, String role) {
        this.token = token;
        this.id = id;
        this.username = username;
        this.nome = nome;
        this.email = email;
        this.cargo = cargo;
        this.role = role;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCargo() { return cargo; }
    public void setCargo(String cargo) { this.cargo = cargo; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
