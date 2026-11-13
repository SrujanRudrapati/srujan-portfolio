import { expect, test, type APIRequestContext } from "@playwright/test";
import { celebal, hero, moreProjects, projectSections } from "../src/data/home";
import { projects } from "../src/data/projects";
import { absoluteUrl, SITE_URL, siteRoutes } from "../src/lib/site";

// v5 search-engine setup, checked on the exported HTML as a crawler fetches it (no JavaScript):
// the sitemap matches the routes that exist, every page has its own title, description, canonical
// and social card, Google verification is on every page, the home page carries Person JSON-LD, and
// headings and project text are in the HTML itself.

const GOOGLE = "hAhqi_3xjSF438uIzD0fdHEzD0uV7QO7mh95xKFqY2A";

/** Decodes the few entities React writes into text and attributes. */
const decode = (s: string) => s.replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");

async function html(request: APIRequestContext, route: string): Promise<string> {
  const res = await request.get(route);
  expect(res.status(), route).toBe(200);
  return decode(await res.text());
}

function meta(doc: string, attr: "name" | "property", key: string): string | undefined {
  const tag = doc.match(new RegExp(`<meta[^>]*${attr}="${key.replace(/[.:]/g, "\\$&")}"[^>]*>`))?.[0];
  return tag?.match(/content="([^"]*)"/)?.[1];
}
const canonical = (doc: string) => doc.match(/<link[^>]*rel="canonical"[^>]*href="([^"]*)"/)?.[1];
const title = (doc: string) => doc.match(/<title>([^<]*)<\/title>/)?.[1];
const textOf = (doc: string) => doc.replace(/<script[\s\S]*?<\/script>/g, "").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

test.describe("v5 SEO", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "server HTML is the same on every device"));

  test("sitemap.xml lists exactly the pages that exist, as absolute URLs", async ({ request }) => {
    const res = await request.get("/sitemap.xml");
    expect(res.status()).toBe(200);
    const locs = [...(await res.text()).matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locs).toEqual(siteRoutes().map(absoluteUrl));
    expect(locs).toHaveLength(1 + 6 + projects.length);
    for (const loc of locs) {
      expect(loc.startsWith(SITE_URL)).toBe(true);
      expect(loc === SITE_URL || !loc.endsWith("/"), `${loc}: trailingSlash is off`).toBe(true);
      const route = `/${loc.slice(SITE_URL.length)}`;
      expect((await request.get(route)).status(), route).toBe(200);
    }
  });

  test("every page: its own title, description, canonical, social card and Google verification", async ({ request }) => {
    test.setTimeout(60_000);
    const titles = new Set<string>();
    const descriptions = new Set<string>();
    for (const route of siteRoutes()) {
      const doc = await html(request, route);
      const t = title(doc);
      const d = meta(doc, "name", "description");
      expect(t, route).toBeTruthy();
      expect(d, route).toBeTruthy();
      titles.add(t!);
      descriptions.add(d!);
      expect(canonical(doc), route).toBe(absoluteUrl(route));
      expect(meta(doc, "property", "og:url"), route).toBe(absoluteUrl(route));
      expect(meta(doc, "property", "og:title"), route).toBe(t);
      expect(meta(doc, "property", "og:description"), route).toBe(d);
      expect(meta(doc, "property", "og:image"), route).toBe(absoluteUrl("/og.png"));
      expect(meta(doc, "property", "og:image:width"), route).toBe("1200");
      expect(meta(doc, "property", "og:image:height"), route).toBe("630");
      expect(meta(doc, "name", "twitter:card"), route).toBe("summary_large_image");
      expect(meta(doc, "name", "google-site-verification"), route).toBe(GOOGLE);
    }
    expect(titles.size, "titles are unique").toBe(siteRoutes().length);
    expect(descriptions.size, "descriptions are unique").toBe(siteRoutes().length - projects.length + new Set(projects.map((p) => p.oneLiner)).size);
    const og = await request.get("/og.png");
    expect(og.status()).toBe(200);
    expect(og.headers()["content-type"]).toContain("image/png");
  });

  test("the home page carries Person JSON-LD built from résumé facts", async ({ request }) => {
    const doc = await (await request.get("/")).text();
    const raw = doc.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    expect(raw).toBeTruthy();
    const person = JSON.parse(raw!);
    expect(person).toMatchObject({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Srujan Rudrapati",
      jobTitle: "Data and AI Engineer",
      url: SITE_URL,
      sameAs: ["https://www.linkedin.com/in/srujan-rudrapati", "https://github.com/SrujanRudrapati"],
    });
    expect(person.alumniOf[0].name).toBe("Rajasthan Technical University");
    expect(person.affiliation[0].name).toBe("Arizona State University");
  });

  test("the redirect and the 404 are not indexed", async ({ request }) => {
    const redirect = await html(request, "/work/surplus-ai");
    expect(meta(redirect, "name", "robots")).toContain("noindex");
    expect(canonical(redirect)).toBe(absoluteUrl("/work/surplus-station"));
    const missing = await request.get("/no-such-page");
    expect(missing.status()).toBe(404);
    expect(meta(decode(await missing.text()), "name", "robots")).toContain("noindex");
  });
});

test.describe("v5 SEO: content is in the HTML, not added by JavaScript", () => {
  test.beforeEach(({ isMobile }) => test.skip(isMobile, "server HTML is the same on every device"));

  test("home: the h1, every project heading, its figures and its text", async ({ request }) => {
    const doc = await html(request, "/");
    const text = textOf(doc);
    expect(doc).toMatch(new RegExp(`<h1[^>]*>${hero.headline}</h1>`));
    for (const p of projectSections) {
      expect(text, p.name).toContain(p.name); // the sr-only heading name
      expect(text).toContain(p.lede);
      for (const part of p.parts) expect(text, part.term).toContain(part.text);
      for (const f of p.figures) expect(text, f.value).toContain(f.value);
    }
    expect(text).toContain(celebal.name);
    for (const t of celebal.tiles) expect(text).toContain(t.label);
    for (const r of moreProjects) expect(text, r.name).toContain(r.name);
  });

  test("every other page: its h1 and, for projects, the title and one-liner", async ({ request }) => {
    test.setTimeout(60_000);
    for (const route of siteRoutes().filter((r) => r !== "/")) {
      const doc = await html(request, route);
      const h1s = [...doc.matchAll(/<h1[\s>][\s\S]*?<\/h1>/g)];
      expect(h1s.length, `${route}: one h1`).toBe(1);
      expect(textOf(h1s[0][0]).trim().length, route).toBeGreaterThan(0);
    }
    for (const p of projects) {
      const text = textOf(await html(request, `/work/${p.slug}`));
      expect(text, p.slug).toContain(p.title);
      expect(text, p.slug).toContain(p.oneLiner);
    }
  });
});
