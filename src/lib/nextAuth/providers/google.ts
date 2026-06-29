import Google from "next-auth/providers/google";

const provider = {
  id: "google",
  enabled: !!(process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET),
  provider: Google({
    clientId: process.env.AUTH_GOOGLE_ID!,
    clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    authorization: {
      params: {
        scope: "openid email profile",
      },
    },
    profile: (profile) => ({
      id: profile.sub,
      email: profile.email,
      name: profile.name,
      image: profile.picture,
    }),
  }),
};

export default provider;
