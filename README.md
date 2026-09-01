# Sistema de Controle de Manutenção Industrial

Plataforma full-stack para gestão de manutenção predial/industrial: cadastro e acompanhamento de máquinas, ordens de serviço (preventivas, corretivas, emergenciais e de instalação), planos de manutenção preventiva, fornecedores, setores, dashboard gerencial e relatórios com exportação PDF/CSV, com aplicativo mobile incluindo modo offline e leitura de QR Code.

## Funcionalidades

- **Autenticação JWT** com 3 perfis de acesso: `ADMIN`, `COORD`, `USER` (senhas com BCrypt)
- **Gestão de máquinas** com cadastro técnico, QR Code, pastas de anexos e associação a fornecedores
- **Ordens de serviço** com fluxo completo (abrir → iniciar → concluir/cancelar), checklists e custos
- **Manutenção preventiva** com calendário, checklist e reagendamento automático
- **Dashboard** com KPIs em tempo real (máquinas, OS, custos, status)
- **Relatórios gerenciais** com exportação em PDF e CSV
- **Upload/download de anexos** (fotos, PDFs, documentos)
- **Scanner de QR Code** para identificação rápida de máquinas no mobile
- **Modo offline** no aplicativo com sincronização posterior
- **Backend serve o frontend web e o APK** em um único acesso

## Arquitetura

```
React Native (mobile)                           Frontend web (Expo export)
        │ Axios + Bearer JWT                            │ (servido pelo backend)
        ▼                                               ▼
┌───────────────────────────────────────────────────────────────┐
│                Spring Boot REST API (porta 8087)               │
│  Controller → Service → Repository (Spring Data JPA) → H2      │
└───────────────────────────────────────────────────────────────┘
```

O aplicativo mobile autentica via `/api/auth/login`, recebe o JWT, armazena localmente e envia o token em todas as requisições através de interceptores Axios. O mesmo backend serve o frontend web exportado do Expo e disponibiliza o download do APK.

## Tecnologias

### Backend (`manutencaobackend`)
- Java 17, Spring Boot 3.2.5, Maven
- Spring Data JPA / Hibernate, Spring Security, Validation, Web
- JWT (JJWT 0.12.6) + BCrypt
- H2 (arquivo local — ideal para demonstração), substituível por PostgreSQL/MySQL via variáveis de ambiente

### Mobile (`manutencao-mobile`)
- React Native + Expo SDK 54, TypeScript (strict)
- React Navigation, Context API, Axios, AsyncStorage
- expo-camera (QR Code), expo-image-picker (anexos), expo-build-properties
- Modo offline com sincronização

## Estrutura do repositório

```text
controle-manutencao/
├── manutencaobackend/   # API REST (Spring Boot) + frontend web + distribuição do APK
└── manutencao-mobile/   # Aplicativo mobile (React Native / Expo)
```

## Como executar (ambiente de demonstração)

### 1. Backend

```bash
cd manutencaobackend
mvn spring-boot:run
```

A API fica disponível em `http://localhost:8087`. No primeiro boot, o `DataInitializer` cria o usuário `admin` (senha padrão `admin123` no modo demonstração — **altere via `APP_ADMIN_PASSWORD`**).

### 2. Mobile

```bash
cd manutencao-mobile
npm install
npx expo start
```

No emulador/dispositivo físico, defina a URL da API com `EXPO_PUBLIC_API_URL` (veja `.env.example`):

```bash
# .env
EXPO_PUBLIC_API_URL=http://192.168.x.x:8087
```

### Variáveis de ambiente (backend)

Consulte `manutencaobackend/.env.example`. As principais:

| Variável | Default | Descrição |
|---|---|---|
| `APP_DATASOURCE_URL` | H2 em arquivo | URL do banco (troque para PostgreSQL/MySQL em produção) |
| `JWT_SECRET` | valor genérico (demo) | Chave de assinatura JWT — **defina um valor forte em produção** |
| `JWT_EXPIRATION` | `86400000` (24h) | Validade do token em ms |
| `APP_ADMIN_PASSWORD` | `admin123` (demo) | Senha do usuário admin criado no boot |
| `APP_H2_CONSOLE_ENABLED` | `false` | Habilita o console H2 (`/h2-console`) |
| `APP_UPLOAD_DIR` | `manutencaoanexos` | Pasta de armazenamento de anexos |

## Segurança

- Tokens JWT com expiração, perfis de autorização (RBAC) e senhas com BCrypt
- Configurações sensíveis (segredos JWT, credenciais de banco, senhas) devem ser fornecidas por **variáveis de ambiente** — nenhum segredo real está versionado
- Dados de demonstração são fictícios; o banco, anexos e artefatos de runtime ficam fora do versionamento (`.gitignore`)

## Melhorias futuras

- Testes automatizados (unitários e de integração)
- Migrações de banco com Flyway/Liquibase
- Armazenamento seguro de tokens no mobile (expo-secure-store)
- Integração contínua (build + testes no GitHub Actions)
- Documentação OpenAPI/Swagger da API
- Notificações push no mobile