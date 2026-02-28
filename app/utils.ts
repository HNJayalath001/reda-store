export const formatRs = (n: number) =>
  `Rs. ${n.toLocaleString("en-LK", { minimumFractionDigits: 2 })}`;

export function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/
  );
  return m ? m[1] : null;
}
