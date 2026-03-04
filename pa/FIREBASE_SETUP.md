# 🔥 Guia de Setup - Firebase

## ✅ Status: Firebase Migrado Completamente!

O projeto foi migrado de **Supabase** para **Firebase Firestore** com sucesso.

---

## 📋 O Que Você Precisa Fazer

### 1. **Criar Coleções no Firestore**

Acesse: [Firebase Console](https://console.firebase.google.com/) > prontoatendimento-5a913 > Firestore

#### Coleção: `users`
Documentos com estrutura:
```json
{
  "email": "user@email.com",
  "role": "user",  // ou "admin"
  "createdAt": "2026-03-04T10:00:00Z"
}
```

- O **ID do documento deve ser o UID do Firebase Auth** (gerado automaticamente no login)

#### Coleção: `convenios`
Documentos com estrutura:
```json
{
  "nome_convenio": "Unimed",
  "cnpj": "00.000.000/0000-00",
  "status": "ativo",  // "ativo", "credenciamento", "suspenso"
  "telefone": "(11) 99999-9999",
  "email": "contato@convenio.com",
  "usuario_portal": "usuario",
  "senha_portal": "senha123",
  "link_portal": "https://portal.convenio.com",
  "prazo_autorizacao": "24 horas",
  "contato_comercial": "João Silva",
  "contato_autorizacao": "Maria Santos",
  "observacoes": "Alguma observação",
  "tipos_atendimento": ["Cirurgias", "Consultórios"],
  "documentos_necessarios": ["RG + CPF", "Comprovante de renda"],
  "regras": ["Autorização prévia obrigatória", "Validade de 12 meses"]
}
```

---

### 2. **Configurar Segurança (Firestore Rules)**

Vá em: **Firestore Database** > **Rules**

Cole estas regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - apenas leitura do próprio perfil
    match /users/{userId} {
      allow read: if request.auth.uid == userId;
      allow write: if request.auth.uid == userId;
    }

    // Convenios collection - todos podem ler, apenas admin pode escrever
    match /convenios/{document=**} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

---

### 3. **Criar Usuários de Teste**

#### Usuário Common (Viewer)
- Email: `user@email.com`
- Senha: `password123`
- Role: `user`

#### Admin
- Email: `admin@email.com`
- Senha: `admin123`
- Role: `admin`

**Passos:**
1. Vá em: **Authentication** > **Users**
2. Click em **Add User**
3. Crie um com email/senha
4. Após criar, vá em **Firestore** e crie um documento em `users/{uid}` com role apropriado

---

### 4. **Variáveis de Ambiente**

O arquivo `.env.local` foi deletado e as credenciais estão hardcoded em `src/lib/firebaseClient.ts`

Para produção, adicione ao Vercel:
- Nenhuma variável adicional necessária (Firebase config já está no código)

---

## 🔐 Arquitetura de Autenticação

```
Usuário Common
├── Login em /
├── Email + Senha
└── Acessa /dashboard (leitura)

Admin
├── Login em /admin/login
├── Email + Senha + Verificação de Role
└── Acessa /admin/dashboard (CRUD completo)
```

---

## 📱 Fluxo de Dados

```
User Login
  ↓
Firebase Auth
  ↓
Busca role em Firestore (users/{uid})
  ↓
AuthContext armazena userRole
  ↓
Componentes usam useAuth() para verificar permissões
```

---

## 🚀 Como Testar Localmente

```bash
npm install
npm run dev
```

1. Abra http://localhost:5173
2. Teste login com:
   - Usuario: `user@email.com` / `password123`
   - Admin: `admin@email.com` / `admin123`

---

## 📝 Próximos Passos

- [ ] Criar usuários de teste no Firebase Auth
- [ ] Criar documentos no Firestore
- [ ] Testar login local
- [ ] Deploy no Vercel
- [ ] Testar CRUD completo

---

## ⚠️ Importante

- **Nunca** compartilhe a API Key do Firebase publicamente
- Use Firestore Rules para controlar acesso
- Sempre verifique role no backend antes de operações sensíveis
- Em produção, considere usar Cloud Functions para validações adicionais
