import { Home } from "@/components/home/Home";
import { homeContent } from "@/data/home";

// v4: the home is a hub (runbook W2). Everything the v3 story held lives on its own route.
export default function Page() {
  return <Home content={homeContent()} />;
}
