import { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { getCollection } from "@/lib/db";
import type { ObjectId } from "mongodb";

interface DBUser {
  _id?:      ObjectId;
  name:      string;
  email:     string;
  password?: string;
  provider?: "credentials" | "google";
  role?:     "customer" | "admin";
  createdAt: string;
}

const useSecureCookies = process.env.NEXTAUTH_URL?.startsWith("https://") ?? false;
const cookiePrefix     = useSecureCookies ? "__Secure-" : "";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        try {
          const users = await getCollection<DBUser>("users");
          const user  = await users.findOne({ email: credentials.email.toLowerCase() });
          if (!user?.password) return null;
          const valid = await compare(credentials.password, user.password);
          if (!valid) return null;
          return {
            id:    String(user._id),
            name:  user.name,
            email: user.email,
            role:  user.role ?? "customer",
          };
        } catch (err) {
          console.error("[auth] authorize error:", err);
          return null;
        }
      },
    }),

    GoogleProvider({
      clientId:     process.env.GOOGLE_CLIENT_ID     || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt:        "consent",
          access_type:   "offline",
          response_type: "code",
        },
      },
    }),
  ],

  session: { strategy: "jwt" },

  cookies: {
    pkceCodeVerifier: {
      name: `${cookiePrefix}next-auth.pkce.code_verifier`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecureCookies },
    },
    state: {
      name: `${cookiePrefix}next-auth.state`,
      options: { httpOnly: true, sameSite: "lax", path: "/", secure: useSecureCookies, maxAge: 900 },
    },
  },

  callbacks: {
    // ── signIn: runs first — upsert the Google user into MongoDB here ──────────
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        try {
          const email = user.email?.toLowerCase();
          if (!email) return false;

          const users    = await getCollection<DBUser>("users");
          const existing = await users.findOne({ email });

          if (!existing) {
            await users.insertOne({
              name:      user.name  || "Google User",
              email,
              provider:  "google",
              role:      "customer",
              createdAt: new Date().toISOString(),
            });
            console.log("[auth] New Google user created:", email);
          } else {
            console.log("[auth] Existing Google user signed in:", email);
          }
        } catch (err) {
          console.error("[auth] signIn DB error:", err);
          return false; // block sign-in if DB write fails so we don't get a ghost session
        }
      }
      return true;
    },

    // ── jwt: attach userId + role from DB to the token ────────────────────────
    async jwt({ token, user, account }) {
      // Credentials sign-in — user object comes from authorize()
      if (account?.provider === "credentials" && user) {
        token.userId = (user as { id: string }).id;
        token.role   = (user as { role?: string }).role ?? "customer";
      }

      // Google sign-in — look up DB record to get _id and role
      if (account?.provider === "google" && user?.email) {
        try {
          const users  = await getCollection<DBUser>("users");
          const dbUser = await users.findOne({ email: user.email.toLowerCase() });
          if (dbUser) {
            token.userId = String(dbUser._id);
            token.role   = dbUser.role ?? "customer";
          }
        } catch (err) {
          console.error("[auth] jwt DB lookup error:", err);
          token.userId = token.sub;
          token.role   = "customer";
        }
      }

      return token;
    },

    // ── session: expose userId + role on the client session object ────────────
    async session({ session, token }) {
      if (session.user) {
        (session.user as { id?: string   }).id   = (token.userId ?? token.sub) as string;
        (session.user as { role?: string }).role  = (token.role ?? "customer")  as string;
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
    error:  "/auth/signin",
  },

  secret: process.env.NEXTAUTH_SECRET,
};