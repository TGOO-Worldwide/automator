import path from "node:path";

// Pasta persistente da aplicação: sobrevive a deploys e reinícios.
// Em produção fica no disco de dados do servidor; localmente, em ./storage.
// Use para uploads e arquivos gerados. Nunca grave fora dela em produção.
export const STORAGE_DIR = process.env.STORAGE_DIR ?? path.join(process.cwd(), "storage");

export const storagePath = (...parts: string[]) => {
  const full = path.join(STORAGE_DIR, ...parts);
  if (!full.startsWith(STORAGE_DIR)) throw new Error("Caminho fora da pasta de storage");
  return full;
};
