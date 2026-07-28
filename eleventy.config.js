// OffsetEase — Eleventy build.
//
// Phase 0 (foundation) strategy: the existing 53 hand-authored pages are copied
// through VERBATIM (byte-identical output) so nothing regresses. New pages and
// shared components (Phases A–P) are added as .njk templates over time; existing
// pages are migrated into templates phase-by-phase. Nothing is rewritten wholesale.

export default function (eleventyConfig) {
  // Everything the live site serves today, copied through unchanged.
  // _redirects MUST land in the publish dir for Netlify to read it.
  const passthrough = [
    "*.html",
    "*.png",
    "*.ico",
    "robots.txt",
    "llms.txt",
    "sitemap.xml",
    "_redirects",
    "CNAME",
  ];
  for (const glob of passthrough) eleventyConfig.addPassthroughCopy(glob);
  eleventyConfig.addPassthroughCopy("og");
  eleventyConfig.addPassthroughCopy("downloads"); // gated lead-magnet assets (Phase G) // per-page OpenGraph images (Phase F)

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data",
    },
    // Only NEW templated pages are processed as templates. Existing .html files
    // are passthrough-copied above, never run through the template engine.
    templateFormats: ["njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk",
  };
}
