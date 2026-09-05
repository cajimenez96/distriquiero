export interface UploadResult {
  fileId: string;
  url: string;
  name: string;
  thumbnailUrl?: string;
}

export async function uploadToImageKit(
  fileBuffer: Buffer,
  fileName: string,
  folder: string = '/products'
): Promise<UploadResult> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  const publicKey = process.env.IMAGEKIT_PUBLIC_KEY;
  const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/distriquiero';

  if (privateKey && publicKey) {
    try {
      const base64File = fileBuffer.toString('base64');
      const formData = new FormData();
      formData.append('file', base64File);
      formData.append('fileName', fileName);
      formData.append('folder', folder);
      formData.append('useUniqueFileName', 'true');

      const authHeader = 'Basic ' + Buffer.from(privateKey + ':').toString('base64');

      const response = await fetch('https://upload.imagekit.io/api/v1/files/upload', {
        method: 'POST',
        headers: {
          Authorization: authHeader
        },
        body: formData
      });

      if (response.ok) {
        const result = (await response.json()) as any;
        return {
          fileId: result.fileId,
          url: result.url,
          name: result.name,
          thumbnailUrl: result.thumbnailUrl || result.url
        };
      }
      console.warn('ImageKit upload returned non-200 status:', await response.text());
    } catch (err) {
      console.warn('ImageKit API error, falling back to local buffer delivery:', err);
    }
  }

  // Graceful fallback when ImageKit keys are not yet provided in .env
  const base64 = fileBuffer.toString('base64');
  const mimeType = fileName.endsWith('.png') ? 'image/png' : fileName.endsWith('.webp') ? 'image/webp' : 'image/jpeg';
  const dataUrl = `data:${mimeType};base64,${base64}`;
  const mockFileId = 'ik_local_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);

  return {
    fileId: mockFileId,
    url: dataUrl,
    name: fileName,
    thumbnailUrl: dataUrl
  };
}
