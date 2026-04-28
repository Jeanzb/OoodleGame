import { serve } from "@hono/node-server";

import { app } from "./app";

const puerto = Number(process.env.PORT ?? 3000);

serve({
  fetch: app.fetch,
  port: puerto,
});

console.log(`Backend escuchando en http://localhost:${puerto}`);
