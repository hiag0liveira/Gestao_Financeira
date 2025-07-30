<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# Backend - API de Gestão Financeira

Esta pasta contém o código-fonte da API RESTful desenvolvida com NestJS. A API é responsável por toda a lógica de negócio, autenticação de usuários e persistência de dados do sistema de Gestão Financeira.

## 🏛️ Arquitetura

A API foi construída seguindo os princípios de uma arquitetura modular, visando a separação de responsabilidades, escalabilidade e manutenibilidade.

### Módulos Principais

- **`AuthModule`**: Responsável pela autenticação de usuários. Implementa o registro (`/signup`) e o login (`/login`) utilizando estratégias de JWT (JSON Web Token).
- **`UsersModule`**: Gerencia as operações relacionadas aos usuários, como a busca de perfil e a atualização de dados.
- **`CategoriesModule`**: Provê o CRUD completo para as categorias de transações de um usuário.
- **`TransactionsModule`**: Lida com o CRUD de transações financeiras, incluindo filtros avançados por data e categoria.
- **`BalanceModule`**: Contém a lógica de negócio para calcular os saldos mensais e por períodos, consolidando os dados das transações.

### Autenticação e Autorização

A segurança da API é garantida através de JSON Web Tokens (JWT).

1.  **Login**: Ao se autenticar com sucesso, o usuário recebe um `access_token`.
2.  **Requisições Seguras**: Para acessar rotas protegidas, o cliente deve enviar este token no cabeçalho `Authorization` com o prefixo `Bearer`.
3.  **`JwtAuthGuard`**: Um `Guard` estratégico verifica a validade do token em cada requisição, garantindo que apenas usuários autenticados possam acessar os recursos.
    > [!TIP]
    > Todos os serviços foram cuidadosamente projetados para aplicar o **escopo de dados**, garantindo que um usuário (`userId` extraído do token) só possa acessar e manipular os seus próprios dados (categorias, transações, etc.).

---

## 🛠️ Ferramentas e Decisões Técnicas

- **Framework**: **NestJS** foi escolhido por sua arquitetura opinativa e modular, que incentiva boas práticas de desenvolvimento e facilita a criação de APIs robustas.
- **ORM**: **TypeORM** é utilizado para o mapeamento objeto-relacional com o banco de dados PostgreSQL.
- **Validação**: O pacote `class-validator` é usado em conjunto com DTOs (Data Transfer Objects) para validar todas as entradas da API.
- **Documentação da API**: **Swagger (OpenAPI)** foi integrado para gerar uma documentação interativa de todos os endpoints, disponível na rota `/api`.

---

## 📦 Estratégia de Banco de Dados

Para este desafio, a opção `synchronize: true` do TypeORM foi ativada.

> [!NOTE]
> Esta configuração faz com que o TypeORM compare as entidades do código com as tabelas do banco de dados a cada inicialização da aplicação, aplicando as alterações automaticamente. É uma ferramenta excelente para acelerar o desenvolvimento.

> [!WARNING]
> A opção `synchronize: true` **não é recomendada para produção**, pois uma alteração acidental no código poderia levar à perda de dados. Em um ambiente de produção, o próximo passo seria desativar essa opção e implementar um sistema de **Migrations** para controlar as alterações no schema do banco de forma segura e versionada.

---

## ▶️ Rodando a Aplicação

Existem duas maneiras de rodar o backend: utilizando Docker (recomendado) ou localmente.

### Rodando com Docker (Recomendado)

O `docker compose up` na raiz do projeto é a forma principal de rodar o backend junto com os outros serviços. No entanto, você pode executar comandos diretamente no container para depuração.

Primeiro, acesse o container:

```bash
docker exec -it gestao_financeira_backend sh
```

Depois, você pode usar os seguintes scripts:

```bash
# Modo de desenvolvimento com watch
$ npm run start:dev

# Modo de produção
$ npm run start:prod
```

### Rodando Localmente (Sem Docker)

Caso prefira rodar a aplicação diretamente na sua máquina, siga os passos abaixo.

#### Pré-requisitos

- **Node.js**: Versão 20 ou superior.
- **npm**: (geralmente instalado com o Node.js).
- **PostgreSQL**: Uma instância do PostgreSQL rodando localmente ou acessível pela rede.

#### Instalação e Configuração

1.  **Navegue até a pasta do backend:**

    ```bash
    cd backend
    ```

2.  **Crie o arquivo de ambiente:**
    Copie o arquivo `.env.example` para `.env` e ajuste a variável `DATABASE_URL` para apontar para a sua instância do PostgreSQL.

    ```bash
    cp .env.example .env
    ```

    > [!TIP]
    > Um exemplo de `DATABASE_URL` para um banco local seria: `postgresql://user:password@localhost:5432/gestao_financeira?schema=public`

3.  **Instale as dependências:**
    ```bash
    npm install
    ```

#### Execução

```bash
# Modo de desenvolvimento com watch
$ npm run start:dev

# Modo de produção
$ npm run start:prod
```
