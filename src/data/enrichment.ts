// Contact enrichment via Apollo's people/match endpoint.
//
// We can't call Apollo directly from the browser: it sends no CORS headers, and
// the API key must not ship in this public bundle. Instead we POST to a small
// Cloudflare Worker (see the cors-proxy project) that adds CORS, holds the
// Apollo key server-side, and forwards to people/match.

const DEFAULT_PROXY_URL = "https://scanner-apollo-proxy.jpalscanner.workers.dev";

export const ENRICHMENT_PROXY_URL =
  import.meta.env.VITE_ENRICHMENT_PROXY_URL || DEFAULT_PROXY_URL;

export type EnrichmentInput = {
  firstName: string;
  lastName: string;
  companyName: string;
};

export type EnrichmentResult = {
  email: string;
  emailStatus: string;
};

// Apollo returns a placeholder address when a record exists but the email
// hasn't been unlocked/revealed for the team. Treat those as "no email".
function isUsableEmail(email: unknown): email is string {
  return (
    typeof email === "string" &&
    email.includes("@") &&
    !email.includes("email_not_unlocked") &&
    !email.includes("not_unlocked")
  );
}

// Pure extractor for the people/match response shape. The verified address is
// the TOP-LEVEL `person.email` (with `person.email_status`). Note that the
// nested `person.contact.email` can be a different/throwaway address, so we
// deliberately do not read it.
export function extractEnrichedEmail(payload: unknown): EnrichmentResult | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const person = (payload as { person?: unknown }).person;

  if (!person || typeof person !== "object") {
    return null;
  }

  const { email, email_status: emailStatus } = person as {
    email?: unknown;
    email_status?: unknown;
  };

  if (!isUsableEmail(email)) {
    return null;
  }

  return {
    email,
    emailStatus: typeof emailStatus === "string" ? emailStatus : "",
  };
}

// Calls the proxy to look up a verified email for a scanned contact. Returns
// null on no match, a network/HTTP error, or an unusable address — enrichment
// is best-effort and must never block the scan flow.
export async function enrichContact(
  input: EnrichmentInput,
  options: { signal?: AbortSignal } = {},
): Promise<EnrichmentResult | null> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const organizationName = input.companyName.trim();

  // Need at least a name to have any chance of a useful match.
  if (!firstName && !lastName) {
    return null;
  }

  try {
    const response = await fetch(ENRICHMENT_PROXY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        name: [firstName, lastName].filter(Boolean).join(" "),
        organization_name: organizationName || undefined,
      }),
      signal: options.signal,
    });

    if (!response.ok) {
      return null;
    }

    return extractEnrichedEmail(await response.json());
  } catch {
    // Network error, abort, or malformed JSON — fail soft.
    return null;
  }
}
