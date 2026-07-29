import { NextRequest, NextResponse } from "next/server";

// プレビュー環境のBasic認証（VercelのPassword Protectionは有料のため自前実装）。
// BASIC_AUTH_USER / BASIC_AUTH_PASSWORD が未設定なら無効（本番公開時は環境変数を外す）。
export function middleware(request: NextRequest) {
  const user = process.env.BASIC_AUTH_USER;
  const password = process.env.BASIC_AUTH_PASSWORD;
  if (!user || !password) return NextResponse.next();

  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Basic ")) {
    const [inputUser, inputPassword] = atob(authHeader.slice(6)).split(":");
    if (inputUser === user && inputPassword === password) {
      return NextResponse.next();
    }
  }
  return new NextResponse("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="We Voice Preview"' },
  });
}

export const config = {
  // 静的アセットは対象外
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
