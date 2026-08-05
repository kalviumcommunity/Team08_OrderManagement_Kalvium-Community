import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    message: "Logged out successfully",
  });

  response.cookies.set({
    name: "token",
    value: "",
    maxAge: 0,
    path: "/",
  });

  response.cookies.set({
    name: "refreshToken",
    value: "",
    maxAge: 0,
    path: "/",
  });

  return response;
}
