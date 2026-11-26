import Image from "next/image";
import { db } from "@/lib/db";

// Página inicial provisória: confirma que deploy e banco estão funcionando.
// Substitua pelo conteúdo real do projeto.
export const dynamic = "force-dynamic";

async function databaseIsUp() {
  try {
    await db.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export default async function Home() {
  const dbUp = await databaseIsUp();
  const appName = process.env.APP_NAME ?? "Nova aplicação";
  const commit = process.env.SOURCE_COMMIT?.slice(0, 7);

  return (
    <main>
      <Image
        className="logo"
        src="/tgoo-logo.png"
        alt="tgoo WORLDWIDE S.A."
        width={338}
        height={122}
        priority
      />
      <h1>{appName}</h1>
      <p className="lead">
        A aplicação está no ar. Edite <code>src/app/page.tsx</code> e faça push na{" "}
        <code>main</code> para publicar.
      </p>

      <dl>
        <div>
          <dt>Banco de dados</dt>
          <dd data-ok={dbUp}>{dbUp ? "Conectado" : "Sem conexão — verifique o DATABASE_URL"}</dd>
        </div>
        {commit && (
          <div>
            <dt>Versão publicada</dt>
            <dd>{commit}</dd>
          </div>
        )}
      </dl>
    </main>
  );
}
