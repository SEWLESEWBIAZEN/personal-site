import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { mediaRepository } from "@/server/repositories/media";
import { MediaLibrary } from "@/components/admin/MediaLibrary";

export const metadata: Metadata = { title: "Media" };

export default async function AdminMediaPage() {
  await requireAdminPage();
  const media = await mediaRepository.findAll();

  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Media library</h1>
          <p className="admin-subtitle">{media.length} FILES · FILES IN USE CANNOT BE DELETED</p>
        </div>
      </div>
      <MediaLibrary media={media} />
    </>
  );
}
