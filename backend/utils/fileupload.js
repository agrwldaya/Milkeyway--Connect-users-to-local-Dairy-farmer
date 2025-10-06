import cloudinary from "cloudinary";

// Upload a single file to Cloudinary
const uploadFile = async (file, folder, quality) => {
  try {
    const options = { folder, resource_type: "auto" };
    if (quality) options.quality = quality;

    const response = await cloudinary.uploader.upload(file.tempFilePath, options);
    return { url: response.secure_url }; // always use secure_url
  } catch (error) {
    return { error: error.message };
  }
};

// Upload single OR multiple files
export const uploadFiles = async (files, fieldName = "farmer_doc") => {
  const uploadedUrls = [];
  const errors = [];

  if (files && files[fieldName]) {
    const docs = Array.isArray(files[fieldName]) ? files[fieldName] : [files[fieldName]];
    const supportedTypes = ["jpg", "jpeg", "png", "pdf"];

    for (const doc of docs) {
      const docType = doc.name.split(".").pop().toLowerCase();

      if (!supportedTypes.includes(docType)) {
        errors.push({ file: doc.name, error: "Unsupported file type" });
        continue;
      }

      const { url, error } = await uploadFile(doc, process.env.FOLDER_NAME || "default_folder");
      if (url) {
        uploadedUrls.push(url);
      } else {
        errors.push({ file: doc.name, error });
      }
    }
  }

  return { uploadedUrls, errors };
};
