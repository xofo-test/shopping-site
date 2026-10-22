/* ============================================================
   Marigold — offline SVG product artwork
   Generates gradient tiles with a product emoji as data URIs,
   standing in for real product photography (no network needed).
   ============================================================ */
export function svgArt(icon: string, c1: string, c2: string): string {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>" +
    "<defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>" +
    "<stop offset='0' stop-color='" + c1 + "'/><stop offset='1' stop-color='" + c2 + "'/>" +
    "</linearGradient></defs>" +
    "<rect width='320' height='320' fill='url(#g)'/>" +
    "<circle cx='270' cy='52' r='46' fill='rgba(255,255,255,0.16)'/>" +
    "<circle cx='44' cy='274' r='64' fill='rgba(255,255,255,0.12)'/>" +
    "<text x='160' y='172' font-size='132' text-anchor='middle' dominant-baseline='central'>" + icon + "</text>" +
    "</svg>";
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}
