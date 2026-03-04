import { Helmet } from "react-helmet-async";
import { buildLocalBusinessSchema } from "@shared/structured-data";

export default function LocalBusinessSchema() {
  const schema = buildLocalBusinessSchema();

  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(schema)}</script>
    </Helmet>
  );
}
