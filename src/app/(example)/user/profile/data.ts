export interface UserProfile {
  name: string;
  role: string;
  avatar: string;
  followers: number;
  following: number;
  about: string;
  location: string;
  email: string;
  company: string;
  school: string;
  social: {
    facebook?: string;
    instagram?: string;
    linkedin?: string;
    twitter?: string;
  };
}

export interface Post {
  id: string;
  author: {
    name: string;
    avatar: string;
  };
  date: string;
  content: string;
  image?: string;
}

export const userProfile: UserProfile = {
  name: "Jaydon Frankie",
  role: "CTO",
  avatar: "🧔",
  followers: 1947,
  following: 9124,
  about:
    "Tart I love sugar plum I love oat cake. Sweet roll caramels I love jujubes. Topping cake wafer..",
  location: "United Kingdom",
  email: "ashlynn.ohara62@gmail.com",
  company: "Gleichner, Mueller and Tromp",
  school: "Nikolaus - Leuschke",
  social: {
    facebook: "https://www.facebook.com/frankie",
    instagram: "https://www.instagram.com/frankie",
    linkedin: "https://www.linkedin.com/in/frankie",
    twitter: "https://www.twitter.com/frankie",
  },
};

export const posts: Post[] = [
  {
    id: "1",
    author: {
      name: "Jaydon Frankie",
      avatar: "🧔",
    },
    date: "28 oct. 2025",
    content:
      "The sun slowly set over the horizon, painting the sky in vibrant hues of orange and pink.",
    image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&h=400&fit=crop",
  },
];
