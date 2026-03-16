const PASSWORD = "vine2026";
const COOKIE_NAME = "site_auth";
const COOKIE_MAX_AGE = 86400; // 24 hours

function getCookie(request, name) {
  const cookieHeader = request.headers.get("Cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? match[1] : null;
}

function loginPage(error = false) {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>VINE Guidelines — Login</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #f8f9fa;
      color: #1a2744;
    }
    .login {
      background: #fff;
      border-radius: 12px;
      padding: 2.5rem;
      width: 100%;
      max-width: 380px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.06);
      text-align: center;
    }
    .login h1 {
      font-size: 1.25rem;
      font-weight: 700;
      margin-bottom: 0.25rem;
    }
    .login p {
      font-size: 0.875rem;
      color: #6b7280;
      margin-bottom: 1.5rem;
    }
    .login input[type="password"] {
      width: 100%;
      padding: 0.75rem 1rem;
      font-size: 1rem;
      border: 1px solid #e2e5e9;
      border-radius: 8px;
      outline: none;
      transition: border-color 0.2s;
      font-family: inherit;
    }
    .login input[type="password"]:focus {
      border-color: #40b2cf;
    }
    .login button {
      width: 100%;
      margin-top: 1rem;
      padding: 0.75rem;
      font-size: 0.9375rem;
      font-weight: 600;
      font-family: inherit;
      background: #40b2cf;
      color: #fff;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      transition: background 0.2s;
    }
    .login button:hover {
      background: #2d8da6;
    }
    .error {
      color: #dc2626;
      font-size: 0.8125rem;
      margin-bottom: 1rem;
    }
  </style>
</head>
<body>
  <form class="login" method="POST">
    <h1>VINE Guidelines</h1>
    <p>Enter the password to continue.</p>
    ${error ? '<p class="error">Incorrect password. Please try again.</p>' : ''}
    <input type="password" name="password" placeholder="Password" autofocus required>
    <button type="submit">Continue</button>
  </form>
</body>
</html>`;

  return new Response(html, {
    status: error ? 401 : 200,
    headers: { "Content-Type": "text/html;charset=UTF-8" },
  });
}

export async function onRequest(context) {
  const { request } = context;

  // If valid cookie exists, pass through
  if (getCookie(request, COOKIE_NAME) === "authenticated") {
    return context.next();
  }

  // Handle form submission
  if (request.method === "POST") {
    const formData = await request.formData();
    const password = formData.get("password");

    if (password === PASSWORD) {
      // Redirect to the originally requested page with auth cookie
      const url = new URL(request.url);
      return new Response(null, {
        status: 302,
        headers: {
          Location: url.pathname,
          "Set-Cookie": `${COOKIE_NAME}=authenticated; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${COOKIE_MAX_AGE}`,
        },
      });
    }

    return loginPage(true);
  }

  // Show login form for all other requests
  return loginPage(false);
}
