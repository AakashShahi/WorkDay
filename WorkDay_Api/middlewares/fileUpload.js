const multer = require("multer")

const { v4: uuidv4 } = require("uuid")

const storage = multer.diskStorage(
    {
        destination: (req, file, cb) => {
            const baseDir = "uploads/";
            // Ensure destination is safe (though here it is hardcoded, it's good practice)
            cb(null, baseDir);
        },
        filename: (req, file, cb) => {
            const ext = file.originalname.split(".").pop().toLowerCase();
            // Validate extension against whitelist
            const allowedExts = ["jpg", "jpeg", "png"];
            if (!allowedExts.includes(ext)) {
                return cb(new Error("Invalid file extension"), false);
            }
            cb(null, `${file.fieldname}-${uuidv4()}.${ext}`);
        }
    }
)

const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only .png, .jpg and .jpeg format allowed!"), false);
    }
}

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter
})

module.exports = {
    single: (fieldname) => upload.single(
        fieldname
    ),

    array: (fieldname, maxCount) =>
        upload.array(
            fieldname, maxCount
        ),

    fields: (fieldsArray) => upload.fields(
        fieldsArray
    )


}