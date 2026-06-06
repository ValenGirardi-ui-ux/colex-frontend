import { adminConfigError, isColexAdminUser } from "@/src/lib/admin";
import { getSessionUser } from "@/src/lib/admin-guard";

export async function assertAdminAction(): Promise<void> {
  const configErr = adminConfigError();
  if (configErr) throw new Error(configErr);

  const user = await getSessionUser();
  if (!user || !isColexAdminUser(user)) {
    throw new Error("No autorizado.");
  }
}
