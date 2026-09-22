# 🎮 MindUp

> **Organize sua vida como um RPG.** Transforme tarefas e objetivos em missões, ganhe XP, evolua atributos e acompanhe sua progressão.

O **MindUp** é um sistema de organização pessoal gamificado inspirado em mecânicas de RPG. A proposta é transformar produtividade e desenvolvimento pessoal em uma experiência mais visual, interativa e mensurável.

O projeto está passando por uma **migração e evolução para React + TypeScript**, deixando para trás uma estrutura mais simples e preparando uma base mais organizada para crescimento, persistência de dados e novas funcionalidades.

---

## 🚧 Status do projeto

**Em desenvolvimento ativo / fase de evolução da aplicação.**

A base atual já deixou de ser apenas um protótipo visual: o frontend React possui integração com o **Supabase**, autenticação, carregamento de perfil e atributos, quests persistidas e ações de gameplay conectadas ao backend.

### O que já está implementado

- ✅ Migração do frontend para **React + TypeScript + Vite**
- ✅ Estrutura de componentes React para as principais telas
- ✅ Navegação entre as áreas principais da aplicação
- ✅ Tela de splash e fluxo de autenticação
- ✅ Integração com **Supabase**
- ✅ Recuperação do perfil do jogador
- ✅ Recuperação dos atributos do jogador
- ✅ Carregamento de quests
- ✅ Abertura e visualização dos detalhes de uma quest
- ✅ Conclusão de quests com persistência no backend
- ✅ Sistema de atributos
- ✅ Skill Tree com desbloqueios persistentes
- ✅ Inventário e equipamento conectados ao Supabase
- ✅ Sistema de Gacha com RPC e estado persistente
- ✅ Perfil do jogador
- ✅ Mentor
- ✅ Conquistas e feedback visual
- ✅ Configurações e alternância de tema
- ✅ Tratamento de erros para evitar tela branca silenciosa
- ✅ Validação de configuração do Supabase no frontend
- ✅ Proteção para uso de chave pública/publishable no cliente

### 🔨 Em evolução

O projeto ainda não deve ser considerado uma versão final ou pronta para produção. Entre os pontos naturais da próxima etapa estão:

- 🔨 Refinamento da experiência de usuário e responsividade
- 🔨 Melhor organização e padronização da arquitetura React
- 🔨 Evolução do sistema de progressão e recompensas
- 🔨 Expansão das quests e objetivos
- 🔨 Melhorias no inventário, equipamentos e Gacha
- 🔨 Polimento visual e de interações
- 🔨 Ampliação da cobertura de validações e testes
- 🔨 Documentação técnica e de configuração
- 🔨 Preparação para uma versão mais estável de produção

> **Nota:** o estado do projeto pode mudar rapidamente. Este README descreve a situação registrada no repositório e não representa uma promessa de funcionalidades futuras.

---

## 🧠 Conceito

A ideia central do MindUp é aplicar conceitos de jogos à organização pessoal.

Em vez de enxergar uma tarefa apenas como algo que precisa ser concluído, ela pode fazer parte de um sistema maior de progressão:

**Tarefa → Quest → XP → Nível → Atributos → Evolução**

Isso permite criar uma relação visual entre pequenas ações do dia a dia e objetivos de longo prazo.

### Exemplo

Uma atividade como:

> Estudar programação por 1 hora

pode ser transformada em uma **quest**, concedendo XP ao jogador quando concluída.

Com o tempo, esse XP contribui para a evolução do personagem e pode se relacionar com atributos, habilidades, equipamentos, conquistas e outras mecânicas do sistema.

---

## ✨ Principais áreas

| Área | Objetivo |
| --- | --- |
| 🏠 **Home** | Visão geral do jogador e das quests |
| ⚔️ **Quests** | Organizar e concluir objetivos |
| 📊 **Atributos** | Acompanhar a evolução do personagem |
| 🌳 **Skill Tree** | Desbloquear habilidades e progressão |
| 🎒 **Inventário** | Gerenciar itens obtidos |
| 🛡️ **Equipamentos** | Equipar itens e conectar recompensas ao personagem |
| 🎰 **Gacha** | Sistema de recompensas aleatórias persistentes |
| 🏆 **Conquistas** | Registrar momentos de progressão |
| 🧙 **Mentor** | Área voltada à orientação e acompanhamento |
| 👤 **Perfil** | Visualizar informações do jogador |
| ⚙️ **Configurações** | Ajustar preferências da aplicação |

---

## 🛠️ Tecnologias

### Frontend

- **React 19**
- **TypeScript**
- **Vite**
- **React Router**
- **CSS**
- **React Compiler**

### Backend / Dados

- **Supabase**
  - Autenticação
  - Banco de dados
  - Persistência do progresso
  - RPCs para operações de gameplay

### Qualidade e desenvolvimento

- **ESLint**
- **TypeScript**
- **Vite HMR**

---

## 📁 Estrutura geral

A aplicação está organizada em uma arquitetura baseada em componentes e serviços:

```text
midnup/
├── src/
│   ├── components/     # Componentes e telas da aplicação
│   ├── lib/            # Configurações e integrações externas
│   ├── services/       # Comunicação e regras relacionadas aos dados
│   ├── styles/         # Estilos da aplicação
│   ├── utils/          # Tipos e utilitários
│   ├── App.tsx         # Orquestração principal da aplicação
│   └── main.tsx        # Entrada do React
├── public/             # Arquivos públicos
├── package.json
├── vite.config.ts
├── tsconfig*.json
└── README.md
```

---

## 🚀 Como executar

### 1. Clone o repositório

```bash
git clone https://github.com/Math-aMalafaia/midnup.git
cd midnup
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure o Supabase

Crie um arquivo `.env.local` na raiz do projeto.

O frontend espera uma URL do Supabase e uma chave pública/publishable. A configuração aceita:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publica
```

Também existem aliases de compatibilidade para configurações que utilizam `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` ou `VITE_SUPABASE_ANON_KEY`.

**Nunca coloque uma service role key ou outra chave secreta no frontend.**

### 4. Configure o banco

O funcionamento completo do gameplay depende das estruturas e funções do Supabase utilizadas pelos serviços do projeto.

A própria aplicação sinaliza quando as migrações necessárias do banco ainda não foram executadas. Verifique as migrações/configuração do seu ambiente antes de iniciar o gameplay completo.

### 5. Inicie o projeto

```bash
npm run dev
```

O Vite exibirá no terminal o endereço local para acessar a aplicação.

---

## 📜 Scripts disponíveis

```bash
# Ambiente de desenvolvimento
npm run dev

# Build de produção
npm run build

# Verificação de lint
npm run lint

# Visualizar o build localmente
npm run preview
```

---

## 🔐 Segurança

O MindUp utiliza o Supabase diretamente no frontend. Por isso, a aplicação foi estruturada para utilizar somente a **chave pública/publishable** no cliente.

A segurança dos dados deve continuar sendo garantida pelas políticas e mecanismos de segurança configurados no Supabase, especialmente **Row Level Security (RLS)**.

> Não utilize chaves secretas ou service role keys em arquivos enviados ao navegador.

---

## 🗺️ Visão de evolução

O desenvolvimento do MindUp pode ser entendido em algumas etapas:

```text
Protótipo visual
      ↓
Migração para React
      ↓
Componentização
      ↓
Integração com Supabase
      ↓
Persistência do gameplay
      ↓
Sistemas de progressão
      ↓
Polimento + estabilidade
      ↓
Versão de produção
```

O projeto atualmente se encontra na etapa de **consolidação da aplicação React integrada ao backend**, enquanto os sistemas de gameplay e a experiência geral continuam sendo refinados.

---

## 🎯 Objetivo do projeto

Mais do que criar uma lista de tarefas com elementos de RPG, o objetivo do MindUp é experimentar uma forma diferente de enxergar produtividade:

> **Cada pequena ação pode fazer parte de uma progressão maior.**

A intenção é transformar organização pessoal em algo que permita visualizar evolução, criar metas, acompanhar hábitos e tornar o processo mais motivador sem perder a função prática de uma ferramenta de organização.

---

## 📌 Status resumido

| Categoria | Estado |
| --- | --- |
| Frontend React | 🟢 Implementado |
| TypeScript | 🟢 Implementado |
| Navegação | 🟢 Implementada |
| Autenticação | 🟢 Integrada |
| Supabase | 🟢 Integrado |
| Perfil | 🟢 Integrado |
| Quests | 🟢 Integradas |
| Atributos | 🟢 Integrados |
| Skill Tree | 🟢 Integrada |
| Inventário | 🟢 Integrado |
| Equipamentos | 🟢 Integrados |
| Gacha | 🟢 Integrado |
| Conquistas | 🟡 Em evolução |
| UX/UI | 🟡 Em evolução |
| Testes | 🟡 Em evolução |
| Produção | ⚪ Ainda não finalizada |

---

## 👨‍💻 Autor

Desenvolvido por **Math-aMalafaia**.

GitHub: https://github.com/Math-aMalafaia

---

## 📄 Licença

Este projeto ainda está em desenvolvimento. Consulte o repositório para informações sobre licença e condições de uso.

---

**MindUp — transforme seus objetivos em quests e acompanhe sua evolução. 🎮🧠**
