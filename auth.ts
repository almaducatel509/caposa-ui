import { loginUser } from "@/app/lib/actions";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { authConfig } from "./auth.config";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({
            username: z.string().min(3, {
              message: "Ce champ doit contenir au moins 3 caractères!",
            }),
            password: z.string().min(6),
          })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { username, password } = parsedCredentials.data;
          const result2 = await loginUser(username, password);
          // console.log(result2)
          if (result2.success) {
            return result2.details;
          } else {
            return null;
          }
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});
