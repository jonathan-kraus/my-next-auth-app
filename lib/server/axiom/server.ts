import axiomClient from '@/lib/server/axiom/axiom';
import { Logger, AxiomJSTransport, ConsoleTransport } from '@axiomhq/logging';
import { createAxiomRouteHandler, nextJsFormatters } from '@axiomhq/nextjs';

export const logger = new Logger({
  transports: [
    new AxiomJSTransport({
      axiom: axiomClient,
      dataset: process.env.NEXT_PUBLIC_AXIOM_DATASET!,
    }),
    new ConsoleTransport({ prettyPrint: true }), // Optional: also log to console
  ],
  formatters: nextJsFormatters,
});

export const withAxiom = createAxiomRouteHandler(logger);
