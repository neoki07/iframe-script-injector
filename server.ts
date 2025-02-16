import { serve } from "bun";

const INJECT_SCRIPT = process.env.INJECT_SCRIPT === "true";
const USE_GTM = process.env.USE_GTM === "true";

const GTM_SNIPPET_HEAD = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-PGTNL93F');</script>
<!-- End Google Tag Manager -->`;

const GTM_SNIPPET_BODY = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-PGTNL93F"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

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

        let modifiedContent = content;

        // GTMスニペットの注入
        if (USE_GTM) {
          modifiedContent = modifiedContent
            .replace("</head>", `${GTM_SNIPPET_HEAD}</head>`)
            .replace("<body>", `<body>${GTM_SNIPPET_BODY}`);
        }

        // スクリプトの注入
        if (INJECT_SCRIPT) {
          const injectedScript =
            '<script src="/scripts/injected.js" type="module"></script>';
          modifiedContent = modifiedContent.replace(
            "</body>",
            `${injectedScript}</body>`,
          );
        }

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
