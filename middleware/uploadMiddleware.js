import multer from "multer";

console.log("[uploadMiddleware.js] Initializing multer for file uploads.");

const storage = multer.memoryStorage();
console.log("[uploadMiddleware.js] Configured multer memory storage.");

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 },
});
console.log("[uploadMiddleware.js] Multer instance created with storage and limits.");

export { upload };
