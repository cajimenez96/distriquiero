import { Router, Response, NextFunction } from 'express';
import multer from 'multer';
import { uploadToImageKit } from '../lib/imagekit.ts';
import { authMiddleware, AuthenticatedRequest } from '../lib/auth.ts';

const router = Router();

const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Formatos admitidos: JPEG, PNG, WEBP, GIF.`));
    }
  }
});

// Middleware to catch Multer errors and return 400
const handleUploadMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  upload.single('file')(req, res, (err: any) => {
    if (err) {
      return res.status(400).json({ error: err.message || 'Error al procesar archivo de subida.' });
    }
    next();
  });
};

// POST /api/admin/upload
router.post(
  '/',
  authMiddleware,
  handleUploadMiddleware,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      if (req.file) {
        const fileName = req.file.originalname || `upload_${Date.now()}.jpg`;
        const result = await uploadToImageKit(req.file.buffer, fileName);
        res.json({
          success: true,
          url: result.url,
          fileId: result.fileId,
          name: result.name,
          thumbnailUrl: result.thumbnailUrl
        });
        return;
      }

      // Also support JSON base64 data payloads
      if (req.body && req.body.base64Data) {
        const { base64Data, fileName } = req.body;
        if (typeof base64Data !== 'string') {
          res.status(400).json({ error: 'Formato de base64 inválido.' });
          return;
        }

        const matches = base64Data.match(/^data:(image\/(jpeg|png|webp|gif));base64,(.+)$/);
        if (!matches) {
          res.status(400).json({
            error: 'Formato de imagen base64 no permitido. Debe ser data:image/(jpeg|png|webp|gif);base64,...'
          });
          return;
        }

        const mimeType = matches[1];
        const buffer = Buffer.from(matches[3], 'base64');
        const ext = mimeType.split('/')[1] === 'jpeg' ? 'jpg' : mimeType.split('/')[1];
        const name = fileName || `product_${Date.now()}.${ext}`;

        const result = await uploadToImageKit(buffer, name);
        res.json({
          success: true,
          url: result.url,
          fileId: result.fileId,
          name: result.name,
          thumbnailUrl: result.thumbnailUrl
        });
        return;
      }

      res.status(400).json({ error: 'No se recibió ningún archivo de imagen para subir.' });
    } catch (err: any) {
      console.error('Upload handler error:', err);
      res.status(500).json({ error: 'Error al procesar la subida a ImageKit.' });
    }
  }
);

export default router;
