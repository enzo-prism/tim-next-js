type JsonLdProps = {
  data: object;
};

/**
 * Server-rendered JSON-LD script tag. Renders structured data into the
 * initial HTML so crawlers see it without executing JavaScript.
 */
export default function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}
