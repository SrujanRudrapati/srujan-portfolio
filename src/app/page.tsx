import { HomeStory } from "@/components/home/HomeStory";
import { homeContent } from "@/data/home";

// V4: the home page is the short pipeline story (about five screens). Every v2 section
// it used to hold lives on its own route now (docs/v3/IA.md); this page is the teaser.
export default function Home() {
  return <HomeStory content={homeContent()} />;
}
