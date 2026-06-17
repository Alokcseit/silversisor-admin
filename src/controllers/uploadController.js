import cloudinary from '../config/cloudinary.js';

const uploadImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataUri = `data:${req.file.mimetype};base64,${b64}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'silverscisor/services',
      resource_type: 'image',
    });

    res.json({
      success: true,
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (err) {
    next(err);
  }
};

export { uploadImage };
