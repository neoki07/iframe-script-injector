import { serve } from "bun";

const server = serve({
  port: 3000,
  fetch(req) {
    const url = new URL(req.url);

    // Ignore favicon requests
    if (url.pathname === "/favicon.ico") {
      return new Response(null, { status: 204 });
    }

    const path = url.pathname === "/" ? "/index.html" : url.pathname;

    try {
      const file = Bun.file(`./public${path}`);
      return new Response(file);
    } catch (error) {
      return new Response("Not Found", { status: 404 });
    }
  },
});

console.log(`Server running at http://localhost:${server.port}`);
