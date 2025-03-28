import { getJwtPayload } from "@/app/actions/jwt";
import { getIsUserAdmin } from "@/app/queries/user";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export const AuthRedirect = async () => {
  const jwt = await getJwtPayload();
  const path = headers().get("x-path");

  // add any path logged off users should be able to see here
  // NOTICE: be sure to add the '/application' part or you could
  // remove auth from an admin route
  const exemptAuthRedirectPaths = ["/application/decks"];
  let isPathExemptFromAuthRedirect = false;
  for (let i = 0; i < exemptAuthRedirectPaths.length; i++) {
    if (path?.includes(exemptAuthRedirectPaths[i])) {
      isPathExemptFromAuthRedirect = true;
    }
  }

  if (!jwt && !isPathExemptFromAuthRedirect) {
    if (!path || path === "/application") {
      redirect("/login");
    }
    redirect(`/login?next=${encodeURIComponent(path)}`);
  }

  if (jwt && path?.includes("/admin")) {
    const isAdmin = await getIsUserAdmin();

    if (!isAdmin) {
      redirect("/application");
    }
  }

  return null;
};
