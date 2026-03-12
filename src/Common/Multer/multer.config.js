import multer from "multer";
import { randomUUID } from "node:crypto";
import path from "node:path";
import { existsSync, mkdirSync } from "node:fs";

export const allowedTypes = {
  img: ["image/jpeg", "image/png", "image/jpg"],
  video: ["video/mp4", "video/mkv", "video/avi"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg"],
};

const localPayload = ({ fileDist, allowedMimeTypes }) => {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const dir = `./uploads/${fileDist}`;
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }
      cb(null, dir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, file.originalname.split(ext).join("") + "-" + randomUUID() + ext);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
      cb(new Error("File type not allowed"), false);
    } else {
      cb(null, true);
    }
  };

  return multer({ storage: storage, fileFilter: fileFilter });
};

export default localPayload;