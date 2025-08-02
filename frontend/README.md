<p align="center">
  <a href="https://nextjs.org/" target="blank"><img src="https://assets.vercel.com/image/upload/v1607554385/repositories/next-js/next-logo.png" width="120" alt="Next.js Logo" /></a>
</p>

# Frontend - Interface de Gestão Financeira

Esta pasta contém o código-fonte da interface do utilizador (UI) desenvolvida com **Next.js 14** e **React**. A aplicação consome a API do backend para proporcionar uma experiência interativa e reativa para a gestão de finanças pessoais.

## 🏛️ Arquitetura e Decisões Técnicas

A interface foi construída com foco numa arquitetura moderna, componentizada e com uma excelente experiência de utilizador (UX).

### Estrutura e Tecnologias

- **Framework**: **Next.js 14 (App Router)** foi escolhido pela sua performance, renderização no servidor (SSR) e pela estrutura organizada baseada em rotas.
- **UI e Estilização**: **shadcn/ui** e **Tailwind CSS** foram utilizados para criar uma interface moderna, responsiva e altamente personalizável, com suporte nativo a temas (Dark/Light Mode).
- **Gestão de Estado**: Para o estado global, como os dados do utilizador autenticado e o controlo da UI do dashboard, foram utilizados **React Contexts** (`AuthProvider`, `DashboardUIProvider`). Esta abordagem nativa do React é ideal para a escala deste projeto.
- **Formulários**: **React Hook Form** e **Zod** foram implementados para a criação de formulários performáticos e com uma validação de dados robusta e segura.
- **Comunicação com a API**: **Axios** foi configurado com um `interceptor` para centralizar a lógica de comunicação com o backend e adicionar automaticamente o token de autenticação JWT a todas as requisições protegidas.

### Fluxo de Autenticação

> [!TIP]
> A segurança das rotas é garantida por um **Middleware** do Next.js. Ele intercepta as requisições, verifica a presença de um cookie de autenticação (`auth_token`) e redireciona o utilizador com base no seu estado de login, protegendo o acesso ao dashboard.

---

## ✨ Funcionalidades Principais

- **Autenticação Completa:** Páginas de Login e Cadastro com design moderno, animações subtis (`framer-motion`) e validação em tempo real.
- **Dashboard Interativo:** Uma única página que serve como um centro de controlo financeiro, com:
  - **Filtros Dinâmicos:** Seleção de períodos por calendário, atalhos para "Este Mês" e "Últimos 30 dias", e um seletor de múltiplas categorias.
  - **Visualização de Dados:** Cards de resumo, um gráfico de pizza para o balanço do período e uma tabela paginada para as transações.
  - **Reatividade em Tempo Real:** Todos os componentes do dashboard atualizam-se instantaneamente ao alterar qualquer filtro.
- **Fluxo de Trabalho Otimizado:** Modais (janelas) para a criação rápida de transações e categorias diretamente do dashboard, com atualização automática dos seletores.
- **Personalização da Interface:** Suporte completo a temas **Claro (Light)** e **Escuro (Dark)**, com a preferência do utilizador a ser guardada.

---

## ▶️ Rodando a Aplicação

As instruções para rodar o projeto completo (frontend + backend) estão no `README.md` principal, na raiz do repositório. Os comandos abaixo são específicos para rodar o frontend de forma isolada.

### Rodando com Docker

O `docker compose up` na raiz do projeto já inicia este serviço.

### Rodando Localmente (Sem Docker)

#### Pré-requisitos

- **Node.js**: Versão 20 ou superior.
- **npm**: (geralmente instalado com o Node.js).

#### Instalação e Configuração

1.  **Navegue até a pasta do frontend:**

    ```bash
    cd frontend
    ```

2.  **Instale as dependências:**
    `bash
npm install
`

> [!NOTE]
> Certifique-se de que o backend já está a rodar, pois o frontend precisa de se conectar à API. A URL da API é configurada pela variável de ambiente `NEXT_PUBLIC_API_URL` no ficheiro `.env` na raiz do projeto.

#### Execução

```bash
# Modo de desenvolvimento com hot-reload
$ npm run dev

# Compilar para produção
$ npm run build

# Iniciar em modo de produção
$ npm run start
```
