/**
 * Utility functions for Philippine Jurisprudence and Legal Sources.
 */

export function generateLegalSourceLinks(grNumber: string) {
  if (!grNumber) return [];

  const cleanQuery = encodeURIComponent(grNumber.trim());

  return [
    {
      name: "Lawphil Project",
      url: `https://www.google.com/search?q=site:lawphil.net+${cleanQuery}`,
      description: "Search full text decision on Lawphil",
    },
    {
      name: "Supreme Court E-Library",
      url: `https://elibrary.judiciary.gov.ph/search?q=${cleanQuery}`,
      description: "Search official Supreme Court repository",
    },
    {
      name: "ChanRobles Law Library",
      url: `https://www.google.com/search?q=site:chanrobles.com+${cleanQuery}`,
      description: "Search ChanRobles legal resource",
    },
  ];
}