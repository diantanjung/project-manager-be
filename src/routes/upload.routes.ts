import { Router } from 'express';
import { upload } from '../middlewares/upload.js';
import { authenticate } from '../middlewares/auth.js';

const router = Router();

router.use(authenticate);

router.post('/', upload.single('avatar'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    // Construct the URL where the file can be accessed
    const fileUrl = `/uploads/${req.file.filename}`;

    return res.status(200).json({ url: fileUrl });
});

export const uploadRoutes = router;
