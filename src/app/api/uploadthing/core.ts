import { createUploadthing, type FileRouter } from "uploadthing/next";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // Define as many FileRoutes as you like, each with a unique routeSlug
  datasetUploader: f({ 
    "text/csv": { maxFileSize: "4MB", maxFileCount: 1 },
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": { maxFileSize: "4MB", maxFileCount: 1 },
    "application/vnd.ms-excel": { maxFileSize: "4MB", maxFileCount: 1 }
  })
    // Set permissions and file types for this FileRoute
    .middleware(async ({ req }) => {
      // You can do auth here if you want
      return { };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for url:", file.url);
      return { uploadedBy: "user", url: file.url };
    }),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
