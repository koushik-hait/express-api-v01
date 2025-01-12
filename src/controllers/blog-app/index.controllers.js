export const sitemapUpdate = asyncHandler(async (req, res) => {
  try {
    const sm = require("sitemap");
    const sitemap = sm.createSitemap({
      hostname: process.env.DOMAIN,
      cacheTime: 600000, // 600 sec - cache purge period
    });

    const blogs = await Blog.find({ status: "PUBLISHED", deleted: false })
      .lean()
      .select("_id title slug createdAt")
      .sort("-createdAt");

    const posts = blogs.map((blog) => ({
      url: `/blog/${blog.slug}`,
      changefreq: "weekly",
      priority: 0.8,
      lastmodrealtime: true,
      lastmod: blog.createdAt,
    }));

    sitemap.add(posts);

    const xml = sitemap.toString();

    await fs.promises.writeFile(`${path.resolve()}/sitemap.xml`, xml);

    res
      .status(200)
      .json(new ApiResponse(200, null, "Sitemap updated successfully"));
  } catch (error) {
    res.status(500).json(new ApiResponse(500, null, error.message));
  }
});
