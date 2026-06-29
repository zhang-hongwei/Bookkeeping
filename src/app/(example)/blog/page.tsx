"use client";

import { Container, Stack } from "@mui/material";
import { useState } from "react";
import { mockPosts } from "./data";
import { BlogFilters, BlogTabs, BlogGrid } from "./components";

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [tabValue, setTabValue] = useState(0);
  const [sortBy, setSortBy] = useState("Latest");

  // Filter posts based on tab and search
  const getFilteredPosts = () => {
    let filtered = mockPosts;

    if (tabValue === 1) {
      filtered = filtered.filter((post) => post.status === "Published");
    } else if (tabValue === 2) {
      filtered = filtered.filter((post) => post.status === "Draft");
    }

    if (searchQuery) {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredPosts = getFilteredPosts();

  return (

    <Stack spacing={3}>
      {/* Search and Sort */}
      <BlogFilters
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
      />

      {/* Tabs */}
      <BlogTabs
        value={tabValue}
        onChange={(_, newValue) => setTabValue(newValue)}
        posts={mockPosts}
      />

      {/* Blog Grid */}
      <BlogGrid posts={filteredPosts} />
    </Stack>

  );
}
