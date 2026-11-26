# Nova aplicação

Next.js + Postgres (Prisma). O deploy é automático: todo push na `main` publica a aplicação.

## Começando

```bash
git clone git@github.com:ORG/NOME-DO-PROJETO.git
cd NOME-DO-PROJETO
cp .env.example .env
npm install
npm run db:up        # sobe o Postgres local (Docker)
npm run db:migrate   # aplica as migrations no banco local
npm run dev          # http://localhost:3000
```

Faça commit do `package-lock.json` gerado no primeiro `npm install`.

## Publicando

```bash
git push origin main
```

Em 2 a 4 minutos a nova versão está no ar no endereço do projeto. O rodapé da página inicial mostra o commit publicado.

Se o deploy não atualizar, abra a aba **Actions** deste repositório: o workflow **CI** roda o mesmo build da produção e mostra o erro.

## Banco de dados

Altere `prisma/schema.prisma` e gere a migration:

```bash
npm run db:migrate -- --name adiciona_tabela_clientes
```

Faça commit da pasta `prisma/migrations`. Em produção as migrations são aplicadas sozinhas a cada deploy. Nunca edite uma migration que já foi publicada; crie uma nova.

## Arquivos e uploads

O container é recriado a cada deploy, então qualquer arquivo gravado fora da pasta de storage é perdido. Para uploads e arquivos gerados, use sempre o helper:

```ts
import { storagePath } from "@/lib/storage";
await fs.writeFile(storagePath("uploads", nome), dados);
```

Em produção essa pasta fica no disco de dados do servidor e é preservada entre deploys. Localmente ela é `./storage`, que está fora do Git.

## Variáveis de ambiente

Precisa de uma nova variável (chave de API, SMTP etc.)? Adicione em `.env.example` com um valor de exemplo e peça ao responsável pela infraestrutura para cadastrar o valor real em produção.

## Verificação

`GET /api/health` responde `200` quando a aplicação e o banco estão funcionando.
