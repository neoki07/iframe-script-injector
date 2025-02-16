import { serve } from "bun";

const server = serve({
  port: 3000,
  async fetch(req) {
    const url = new URL(req.url);

    // Ignore favicon requests
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    const path = url.pathname === "/" ? "/index.html" : url.pathname;

    try {
      const file = Bun.file(`./public${path}`);

      // スクリプトの注入をindex.htmlのみに限定
      if (path === "/index.html") {
        const content = await file.text();
        const injectedScript =
          '<script src="/scripts/injected.js" type="module"></script>';

        const modifiedContent = content.replace(
          "</body>",
          `${injectedScript}</body>`,
        );

        return new Response(modifiedContent, {
          headers: { "Content-Type": "text/html" },
        });
      }

      // For other files, return as is
      return new Response(file);
    } catch (error) {
      return new Response("Not Found", { status: 404 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);
