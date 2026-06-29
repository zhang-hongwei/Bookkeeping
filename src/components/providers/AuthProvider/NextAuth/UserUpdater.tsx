"use client";

import { useSession } from "next-auth/react";
import { memo, useEffect } from "react";

import { useUserStore } from "@/store/user";
import { UserInfo } from "@/store/user/types";

// update the user data into the context
const UserUpdater = memo(() => {
  const { data: session, status } = useSession();
  const isLoaded = status !== "loading";

  const isSignedIn =
    (status === "authenticated" && session && !!session.user) || false;

  const nextUser = session?.user;

  // 使用 useEffect 处理需要保持同步的用户数据
  useEffect(() => {
    if (!isLoaded) return;

    const store = useUserStore.getState();

    if (nextUser && isSignedIn) {
      const currentUserInfo = store.userInfo;

      const userInfo: UserInfo = {
        id: nextUser.id || "",
        username: nextUser.name || nextUser.email || "User",
        name: nextUser.name || "",
        email: nextUser.email || "",
        avatar: nextUser.image || currentUserInfo?.avatar || "",
        phone: "",
        role: "user",
        permissions: [],
        lastLoginTime: new Date().toISOString(),
        status: "active",
      };

      // 更新用户信息和登录状态
      store.internal_setUserInfo(userInfo);
      store.login("nextauth-session", { id: nextUser.id || "", email: nextUser.email || "" });
    } else if (!isSignedIn) {
      // 用户未登录时清理状态
      store.logout();
    }
  }, [nextUser, isSignedIn, isLoaded]);
  return null;
});

export default UserUpdater;
