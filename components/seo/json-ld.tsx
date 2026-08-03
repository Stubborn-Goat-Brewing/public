/**
 * Renders a JSON-LD structured-data script tag.
 *
 * Server-render this so search engines see the structured data in the initial
 * HTML. `data` may be a single schema object or an array of them.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inject; it contains no executable markup.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  )
}
