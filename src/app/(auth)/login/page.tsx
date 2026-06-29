"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Divider, Typography } from "@mui/material";
import Toast from "@/components/ui/Toast";
import { LoginHeader } from "./components/LoginHeader";
import { SocialLoginButtons } from "./components/SocialLoginButtons";
import { LoginForm } from "./components/LoginForm";
import { RegisterPrompt } from "./components/RegisterPrompt";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("demo@test.cc");
  const [password, setPassword] = useState("@test");

  // Handle URL error parameters
  useEffect(() => {
    const error = searchParams.get("error");
    if (error) {
      const errorMessages: Record<string, string> = {
        CredentialsSignin: "用户名或密码错误",
        OAuthSignin: "OAuth 登录失败",
        OAuthCallback: "OAuth 回调处理失败",
        OAuthCreateAccount: "无法创建 OAuth 账户",
        EmailCreateAccount: "无法创建邮箱账户",
        Callback: "回调处理失败",
        OAuthAccountNotLinked: "OAuth 账户未关联到现有账户",
        EmailSignin: "邮箱登录失败",
        CredentialsSignup: "注册失败",
        SessionRequired: "需要登录访问",
        AccessDenied: "访问被拒绝",
        Verification: "验证失败",
        Configuration: "系统配置错误,请联系管理员",
      };

      const message = errorMessages[error] || "登录失败,请稍后重试";
      Toast.error(message);

      // Clear error parameters from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("error");
      url.searchParams.delete("code");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("log==handleSubmit=>>>");
    router.push("/app");
  };

  const handleSocialLogin = (provider: string) => {
    console.log(`Login with ${provider}`);
    // Implement social login logic here
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        px: { xs: 0, sm: 1, md: 2 },
      }}
    >
      <LoginHeader />

      <SocialLoginButtons onSocialLogin={handleSocialLogin} />

      <Divider sx={{ my: { xs: 2.5, sm: 3 } }}>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ fontSize: { xs: "0.813rem", sm: "0.875rem" } }}
        >
          Or Login With
        </Typography>
      </Divider>

      <LoginForm
        email={email}
        password={password}
        onEmailChange={setEmail}
        onPasswordChange={setPassword}
        onSubmit={handleSubmit}
      />

      <RegisterPrompt />
    </Box>
  );
}
