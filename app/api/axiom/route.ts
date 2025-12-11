// app/api/axiom/route.ts
import { withAxiom, logger } from "@/lib/axiom/server";

export const GET = withAxiom(async (req) => {
  logger.info("User accessed example endpoint", {
    method: req.method,
    url: req.url,
  });

  try {
    // Your logic here
    return new Response("Success!", { status: 200 });
  } catch (error) {
    logger.error("Error in example endpoint", { error });
    return new Response("Error", { status: 500 });
  }
});
