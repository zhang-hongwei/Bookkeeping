import GitHub from "next-auth/providers/github";

const provider = {
  id: "github",
  enabled: !!(process.env.AUTH_GITHUB_ID && process.env.AUTH_GITHUB_SECRET),
  provider: GitHub({
    clientId: process.env.AUTH_GITHUB_ID!,
    clientSecret: process.env.AUTH_GITHUB_SECRET!,
    authorization: {
      params: {
        scope: "read:user user:email",
      },
    },
    profile: (profile) => ({
      id: profile.id.toString(),
      email: profile.email,
      name: profile.name || profile.login,
      image: profile.avatar_url,
    }),
  }),
};

export default provider;
