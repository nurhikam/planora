import { generateOpenAPIDoc } from "@/lib/openapi";

export async function GET() {
  const spec = generateOpenAPIDoc();

  if (process.env.API_DOCS_ENABLED !== "true") {
    return Response.json(spec);
  }

  return new Response(
    `<!DOCTYPE html>
<html>
<head>
  <title>Planora API Docs</title>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body>
  <div id="api-docs"></div>
  <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  <script>
    Scalar.createApiReference("#api-docs", {
      spec: ${JSON.stringify(spec)},
    });
  </script>
</body>
</html>`,
    {
      headers: { "Content-Type": "text/html" },
    },
  );
}
