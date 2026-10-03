// Fixture-only render profiling; never part of the application build.
module.exports = function instrumentAnnouncement(source) {
  return source.replace(
    '\n  const ',
    '\n  if (typeof window !== "undefined") window.__performanceAnnouncementRenders = (window.__performanceAnnouncementRenders ?? 0) + 1;\n  const ',
  )
}
