import { jwtClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

// Same-origin auth. This keeps cookies and JWTs pinned to whichever host the
// storefront is served from (belaviewbd.com in production, localhost in dev)
// without baking a deployment URL into the client bundle.
export const authClient = createAuthClient({
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
