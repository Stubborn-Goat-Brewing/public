import { HomeClient } from "./home-client"

// The homepage uses the default title, description, and canonical ("/") defined
// in the root layout, so no per-page metadata override is needed here. The
// homepage renders statically; dynamic event data loads via the cached
// /api/events/featured endpoint.
export default function Page() {
  return <HomeClient />
}
