# Desafio Fullstack - Gestão Financeira

Este projeto é uma solução completa para o desafio de desenvolvimento de um sistema de gestão financeira pessoal. A aplicação permite aos usuários cadastrar receitas e despesas, gerenciar transações e visualizar o fluxo de caixa mensal.

## Tecnologias Utilizadas

- **Backend:** NestJS, TypeORM
- **Frontend:** Next.js 14, React, Tailwind CSS
- **Banco de Dados:** PostgreSQL
- **Containerização:** Docker

---

## 🚀 Como Rodar o Projeto

Este projeto é totalmente containerizado, então tudo que você precisa é ter o Docker e o Docker Compose instalados em sua máquina.

### Pré-requisitos

- [Docker](https://www.docker.com/get-started)
- [Docker Compose](https://docs.docker.com/compose/install/) (geralmente já vem com o Docker Desktop)

> [!TIP]
> Você pode usar qualquer sistema operacional, seja ele **Windows**, **macOS** ou **Linux**.\
> Essa é a magia do **Docker** 🐳

### Passo a Passo

1.  **Clone o repositório:**

    ```bash
    git clone [https://github.com/hiag0liveira/Gestao_Financeira.git](https://github.com/hiag0liveira/Gestao_Financeira.git)
    cd Gestao_Financeira
    ```

2.  **Crie o arquivo de ambiente:**
    Duplique o arquivo de exemplo `.env.example` e renomeie a cópia para `.env`. Os valores padrão já estão configurados para um ambiente de desenvolvimento.

    ```bash
    cp .env.example .env
    ```

3.  **Suba os containers:**
    Abra seu terminal na raiz do projeto e execute o seguinte comando:

    ```bash
    docker compose up --build
    ```

    > [!NOTE]
    > Dependendo da sua versão do Docker, o comando pode ser `docker-compose` (com hífen). Se `docker compose` não funcionar, tente a versão com hífen:
    >
    > ```bash
    > docker-compose up --build
    > ```

4.  **Pronto!** A aplicação estará disponível nos seguintes endereços:
    - **Frontend (Next.js):** http://localhost:3001
    - **Backend (NestJS):** http://localhost:3000

> [!WARNING]
> O argumento `--build` é necessário apenas na primeira vez ou quando você instalar novas dependências. Para as próximas vezes, você pode usar apenas `docker compose up`.

---

## 🏛️ Diagramas de Arquitetura

Para uma melhor compreensão da estrutura e do fluxo do sistema, abaixo estão alguns diagramas que ilustram a arquitetura do projeto.

### Diagrama de Caso de Uso

```mermaid
graph TD
    A[Usuário] --> B{Cadastrar-se}
    A --> C{Autenticar-se}
    A --> D{Gerenciar Transações}
    D --> D1(Criar Transação)
    D --> D2(Listar Transações)
    D --> D3(Excluir Transação)
    A --> E{Consultar Saldo Mensal}
    A --> F{Visualizar Fluxo de Caixa}

    subgraph "Ações do Usuário"
        B
        C
        D
        E
        F
    end
```

### Diagrama de Componentes

```mermaid
graph TD
    subgraph "Navegador do Usuário"
        Frontend["Frontend (Next.js + React)"]
    end

    subgraph "Servidor"
        Backend["Backend (NestJS API)"]
        Database["Database (PostgreSQL)"]
    end

    Frontend -- "Requisições HTTP/REST API" --> Backend
    Backend -- "Consultas SQL/TypeORM" --> Database
```

### Diagrama de Sequência (Fluxo Completo: Login e Criação de Transação)

```mermaid
sequenceDiagram
    participant U as Usuário
    participant F as Frontend (Next.js)
    participant B as Backend (API NestJS)
    participant DB as Banco de Dados (PostgreSQL)

    note over U, DB: Etapa 1: Autenticação
    U->>F: Preenche e envia formulário de login
    activate F
    F->>B: POST /auth/login com email e senha
    activate B
    B->>DB: Busca usuário pelo email
    activate DB
    DB-->>B: Retorna dados do usuário (com senha hash)
    deactivate DB
    B->>B: Compara senha fornecida com o hash salvo
    alt Credenciais Válidas
        B->>B: Gera Token JWT
        B-->>F: Retorna { access_token: "jwt" }
        F->>F: Armazena token (ex: cookie HttpOnly)
        F-->>U: Redireciona para o Dashboard
    else Credenciais Inválidas
        B-->>F: Retorna erro 401 Unauthorized
        F-->>U: Exibe mensagem de erro
    end
    deactivate B
    deactivate F

    note over U, DB: Etapa 2: Criação de Transação (Rota Protegida)
    U->>F: Preenche formulário e cria nova transação
    activate F
    F->>B: POST /transactions com dados e Token JWT
    activate B
    Note right of F: O token é enviado no cabeçalho "Authorization"
    B->>B: AuthGuard intercepta a requisição e valida o JWT
    B->>DB: Insere a nova transação associada ao userId do token
    activate DB
    DB-->>B: Confirma e retorna a transação criada
    deactivate DB
    B-->>F: Retorna a transação criada com sucesso (201)
    deactivate B
    F-->>U: Atualiza a UI com a nova transação
    deactivate F

```

---

> [!IMPORTANT]
> A organização e o desenvolvimento das funcionalidades devem seguir as tarefas definidas no quadro Kanban do projeto no GitHub. Isso garante que todos os requisitos do desafio sejam atendidos de forma organizada ⚡️
