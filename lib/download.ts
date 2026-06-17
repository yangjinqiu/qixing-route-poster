/**
 * Download utility — packs 9 PNG blobs into a ZIP file and triggers download.
 */

import JSZip from 'jszip';

export async function downloadZip(blobs: (Blob | null)[]): Promise<void> {
  const zip = new JSZip();

  for (let i = 0; i < blobs.length; i++) {
    if (blobs[i]) {
      // Pad with zero: 01.png, 02.png, ..., 09.png
      const filename = `${String(i + 1).padStart(2, '0')}.png`;
      zip.file(filename, blobs[i]!);
    }
  }

  const zipBlob = await zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });

  // Trigger download
  const url = URL.createObjectURL(zipBlob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'qixing-route-photos.zip';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
