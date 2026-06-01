# Deploy — Portal de Treinamento
## EasyPanel no VPS 193.203.182.240

---

## PASSO 1 — Criar projeto no Supabase

1. Acesse https://supabase.com → New project
2. Nome: `treinamento-clinica`
3. Anote:
   - Project URL: `https://XXXX.supabase.co`
   - anon key (Settings → API)
   - service_role key (Settings → API)

4. Vá em **SQL Editor** e cole o conteúdo do arquivo `supabase_schema.sql`
   Execute. Isso cria as tabelas e insere os usuários.

---

## PASSO 2 — Subir código no GitHub

```bash
cd treinamento-clinica
git init
git add .
git commit -m "feat: portal de treinamento v1"
gh repo create treinamento-clinica --private --push
```
(ou crie o repositório manualmente em github.com)

---

## PASSO 3 — Criar app no EasyPanel

1. Acesse seu EasyPanel → **Create Service → App**
2. Nome: `treinamento`
3. Source: GitHub → selecione o repositório
4. Build Method: **Dockerfile**
5. Port: `3000`
6. Domain: `treinamento.seudominio.com.br`

---

## PASSO 4 — Configurar variáveis de ambiente no EasyPanel

Em **Environment Variables**, adicione:

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
ADMIN_PASSWORD=admin@hera2024
```

---

## PASSO 5 — Deploy

Clique em **Deploy**. Aguarde ~3 minutos para o build Docker.

---

## PASSO 6 — Acessar

| URL | Usuário |
|-----|---------|
| `treinamento.seudominio.com.br` | atendente@clinica.com / hera2024 |
| `treinamento.seudominio.com.br` | atendente2@clinica.com / hera2024 |
| `treinamento.seudominio.com.br/admin` | admin@clinica.com / admin@hera2024 |

---

## Adicionar novas atendentes

No Supabase SQL Editor:
```sql
INSERT INTO users (email, name, role)
VALUES ('nova@clinica.com', 'Nome da Atendente', 'atendente');
```

E adicione a senha no arquivo `app/api/auth/route.ts`:
```typescript
'nova@clinica.com': 'senhaescolhida',
```

---

## Estrutura do projeto

```
app/
  page.tsx              ← redireciona conforme role
  login/page.tsx        ← tela de login
  treinamento/page.tsx  ← plataforma das atendentes
  admin/page.tsx        ← painel admin
  api/
    auth/route.ts       ← login/logout
    progress/route.ts   ← salva progresso dos módulos
    quiz/route.ts       ← salva tentativas da avaliação
    admin/route.ts      ← dados do painel admin
    me/route.ts         ← verifica sessão

components/
  TrainamentoPlatform.tsx  ← toda lógica da atendente
  AdminDashboard.tsx       ← painel do admin

lib/
  supabase.ts   ← cliente Supabase
  auth.ts       ← helper de sessão via cookie
  data.ts       ← módulos e questões
```
