// Blog post data interface
export interface BlogPost {
  id: string;
  title: string;
  description: string;
  image: string;
  status: "Draft" | "Published";
  date: string;
  author: {
    name: string;
    avatar: string;
  };
  stats: {
    comments: string;
    views: string;
    shares: string;
  };
}

// Mock data
export const mockPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Future of Renewable Energy: Innovations and Challenges Ahead",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post1.jpg",
    status: "Draft",
    date: "19 oct. 2025",
    author: {
      name: "John Doe",
      avatar: "/avatars/user1.jpg",
    },
    stats: {
      comments: "1.95 k",
      views: "9.91 k",
      shares: "9.12 k",
    },
  },
  {
    id: "2",
    title:
      "Exploring the Impact of Artificial Intelligence on Modern Healthcare",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post2.jpg",
    status: "Published",
    date: "18 oct. 2025",
    author: {
      name: "Jane Smith",
      avatar: "/avatars/user2.jpg",
    },
    stats: {
      comments: "9.12 k",
      views: "1.95 k",
      shares: "6.98 k",
    },
  },
  {
    id: "3",
    title: "Climate Change and Its Effects on Global Food Security",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post3.jpg",
    status: "Published",
    date: "17 oct. 2025",
    author: {
      name: "Mike Johnson",
      avatar: "/avatars/user3.jpg",
    },
    stats: {
      comments: "6.98 k",
      views: "9.12 k",
      shares: "8.49 k",
    },
  },
  {
    id: "4",
    title: "The Rise of Remote Work: Benefits, Challenges, and Future Trends",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post4.jpg",
    status: "Draft",
    date: "16 oct. 2025",
    author: {
      name: "Sarah Wilson",
      avatar: "/avatars/user4.jpg",
    },
    stats: {
      comments: "8.49 k",
      views: "6.98 k",
      shares: "2.03 k",
    },
  },
  {
    id: "5",
    title: "Understanding Blockchain Technology: Beyond Cryptocurrency",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post5.jpg",
    status: "Published",
    date: "15 oct. 2025",
    author: {
      name: "Tom Brown",
      avatar: "/avatars/user5.jpg",
    },
    stats: {
      comments: "2.03 k",
      views: "8.49 k",
      shares: "3.36 k",
    },
  },
  {
    id: "6",
    title:
      "Mental Health in the Digital Age: Navigating Social Media and Well-being",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post6.jpg",
    status: "Published",
    date: "14 oct. 2025",
    author: {
      name: "Emma Davis",
      avatar: "/avatars/user6.jpg",
    },
    stats: {
      comments: "3.36 k",
      views: "2.03 k",
      shares: "8.4 k",
    },
  },
  {
    id: "7",
    title: "Sustainable Fashion: How the Industry is Going Green",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post7.jpg",
    status: "Draft",
    date: "13 oct. 2025",
    author: {
      name: "Chris Lee",
      avatar: "/avatars/user7.jpg",
    },
    stats: {
      comments: "1.85 k",
      views: "7.23 k",
      shares: "4.56 k",
    },
  },
  {
    id: "8",
    title:
      "Space Exploration: New Frontiers and the Quest for Extraterrestrial Life",
    description:
      "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text...",
    image: "/blog/post8.jpg",
    status: "Published",
    date: "12 oct. 2025",
    author: {
      name: "Alex Turner",
      avatar: "/avatars/user8.jpg",
    },
    stats: {
      comments: "5.67 k",
      views: "3.45 k",
      shares: "9.12 k",
    },
  },
];
