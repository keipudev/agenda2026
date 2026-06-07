# 📅 Agenda Pessoal 2026

Uma aplicação web para organizar sua vida até o final de 2026 com grade de horas, anotações e eventos.

## 🎯 Características

- ✅ **Calendário Completo**: Visualize todos os meses de 2026
- ✅ **Grade de Horas**: Visualize seu dia com divisão em horas (00:00 até 23:00)
- ✅ **Eventos Organizados**: Crie, edite e delete eventos
- ✅ **Anotações**: Adicione descrições e detalhes aos eventos
- ✅ **Cores Personalizadas**: Cada evento pode ter sua própria cor
- ✅ **Expandível**: Clique em qualquer evento para ver/editar detalhes
- ✅ **Persistência**: Todos os dados são salvos em banco de dados SQLite
- ✅ **Interface Intuitiva**: Design responsivo e fácil de usar

## 📦 Estrutura do Projeto

```
agenda2026/
├── app.py                 # Backend Flask
├── requirements.txt       # Dependências Python
├── static/
│   ├── style.css         # Estilos CSS
│   └── script.js         # Lógica JavaScript (frontend)
├── templates/
│   └── index.html        # Interface HTML
├── database/
│   └── agenda.db         # Banco de dados SQLite (criado automaticamente)
└── README.md             # Este arquivo
```

## 🚀 Como Usar

### 1. Instalar Dependências

```bash
cd c:\agenda2026
pip install -r requirements.txt
```

### 2. Executar a Aplicação

```bash
python app.py
```

A aplicação estará disponível em: **http://localhost:5000**

### 3. Parar a Aplicação

Pressione `CTRL + C` no terminal

## 📚 Como Funciona

### Interface Principal

A aplicação possui **3 abas principais**:

#### 1️⃣ **Calendário**
- Visualize todos os meses de 2026
- Navegue com os botões "Anterior" e "Próximo"
- Dias com eventos têm um ponto vermelho
- Clique em qualquer dia para selecioná-lo

#### 2️⃣ **Dia** (Grade de Horas)
- Visualize os eventos do dia selecionado
- Grade organizada de 00:00 até 23:00 (meia-noite à meia-noite)
- Cada evento aparece na sua hora
- Clique em um evento para editar

#### 3️⃣ **Anotações**
- **Lado Esquerdo**: Formulário para criar/editar eventos
  - Data
  - Hora
  - Título
  - Descrição/Anotações
  - Duração (1 a 4 horas)
  - Cor personalizada
- **Lado Direito**: Lista de eventos do dia

### Banco de Dados

O SQLite armazena:
- **ID**: Identificador único
- **Data**: Data do evento (YYYY-MM-DD)
- **Hora**: Hora do evento (HH:MM)
- **Título**: Nome do evento
- **Descrição**: Anotações e detalhes
- **Duração**: Quantas horas dura (1-4)
- **Cor**: Cor personalizável (hexadecimal)
- **Criado em**: Timestamp de criação

### API REST

A aplicação usa uma API interna:

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/` | Abre a página principal |
| GET | `/api/meses` | Retorna estrutura de todos os meses |
| GET | `/api/eventos/<data>` | Retorna eventos de um dia |
| POST | `/api/evento` | Cria novo evento |
| PUT | `/api/evento/<id>` | Atualiza um evento |
| DELETE | `/api/evento/<id>` | Deleta um evento |

## 💡 Exemplos de Uso

### Criar um Evento

1. Abra a aba **"Anotações"**
2. Selecione a data no calendário
3. Escolha a hora
4. Digite o título (ex: "Reunião com time")
5. Adicione descrição (ex: "Discutir sprint 5")
6. Escolha duração e cor
7. Clique **"Salvar"**

### Editar um Evento

1. Clique no evento na grade de horas ou na lista
2. Um modal abrirá com os detalhes
3. Modifique o que quiser
4. Clique **"Atualizar"**

### Deletar um Evento

1. Clique no evento
2. No modal, clique **"Deletar"**
3. Confirme a exclusão

## 🎨 Dicas de Produtividade

- **Use cores**: Associe cores a categorias (azul=trabalho, verde=pessoal, etc)
- **Seja específico**: Títulos claros e descritivos ajudam
- **Planeje antecipadamente**: Preencha sua agenda com antecedência
- **Revise regularmente**: Abra a agenda frequentemente para não perder compromissos
- **Anotações detalhadas**: Use a descrição para detalhes importantes

## ⚙️ Tecnologias Utilizadas

- **Backend**: Python + Flask
- **Frontend**: HTML5 + CSS3 + JavaScript (Vanilla)
- **Banco de Dados**: SQLite
- **Design**: CSS Grid e Flexbox para layout responsivo

## 📱 Compatibilidade

- ✅ Funciona em navegadores modernos (Chrome, Firefox, Safari, Edge)
- ✅ Responsivo para diferentes tamanhos de tela
- ✅ Requer Python 3.7+
- ✅ Windows, macOS e Linux

## 🔧 Troubleshooting

### Erro: "ModuleNotFoundError: No module named 'flask'"
```bash
pip install Flask==2.3.0
```

### Erro: "Port 5000 already in use"
A porta 5000 já está em uso. Modifique no final do `app.py`:
```python
app.run(debug=True, port=5001)  # Ou outra porta
```

### Banco de dados corrompido
Delete o arquivo `database/agenda.db` e reinicie a aplicação. Um novo banco será criado automaticamente.

## 📝 Roadmap Futuro

- [ ] Exportar agenda para PDF
- [ ] Sincronizar com Google Calendar
- [ ] Notificações de eventos
- [ ] Marcação de tarefas concluídas
- [ ] Backup automático
- [ ] Modo escuro

## 🎁 Enjoy Your Calendar!

Organize sua vida, alcance seus objetivos e termine 2026 com sucesso! 🎯

---

**Criado em**: 2026
**Versão**: 1.0
