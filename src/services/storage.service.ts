import { createClient } from "@/lib/supabase/server";

export class StorageService {
  private static BUCKET_NAME = "media";

  /**
   * Helper to generate an SEO-friendly filename.
   * e.g. "Aura Gold Pendant.jpg" -> "aura-gold-pendant-171829381.jpg"
   */
  private static generateSeoFilename(originalName: string): string {
    const dotIndex = originalName.lastIndexOf(".");
    const ext = dotIndex !== -1 ? originalName.slice(dotIndex) : "";
    const base = dotIndex !== -1 ? originalName.slice(0, dotIndex) : originalName;
    
    const slug = base
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
      
    const uniqueId = Math.floor(100000 + Math.random() * 900000);
    return `${slug}-${uniqueId}${ext}`;
  }

  /**
   * Upload a file to a specific folder in the media bucket.
   */
  static async uploadFile(file: File, folder: string = "misc"): Promise<string> {
    const supabase = await createClient();
    const seoName = this.generateSeoFilename(file.name);
    const path = `${folder}/${seoName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(path, buffer, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: urlData } = supabase.storage
      .from(this.BUCKET_NAME)
      .getPublicUrl(path);

    return urlData.publicUrl;
  }

  /**
   * Delete a file from the media bucket using its public URL.
   */
  static async deleteFile(publicUrl: string): Promise<void> {
    const supabase = await createClient();
    
    // Extract the path from the public URL
    // e.g., https://.../storage/v1/object/public/media/products/some-file.jpg -> products/some-file.jpg
    const searchString = `/storage/v1/object/public/${this.BUCKET_NAME}/`;
    const index = publicUrl.indexOf(searchString);
    if (index === -1) {
      throw new Error("Invalid public URL for file deletion");
    }

    const path = publicUrl.slice(index + searchString.length);

    const { error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .remove([path]);

    if (error) {
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * List all files in a specific folder.
   */
  static async listFiles(folder: string = ""): Promise<{ name: string; url: string; created_at: string }[]> {
    const supabase = await createClient();

    const { data, error } = await supabase.storage
      .from(this.BUCKET_NAME)
      .list(folder, {
        limit: 100,
        sortBy: { column: "created_at", order: "desc" },
      });

    if (error) {
      throw new Error(`Failed to list files: ${error.message}`);
    }

    return (data || []).map((file) => {
      const filePath = folder ? `${folder}/${file.name}` : file.name;
      const { data: urlData } = supabase.storage
        .from(this.BUCKET_NAME)
        .getPublicUrl(filePath);

      return {
        name: file.name,
        url: urlData.publicUrl,
        created_at: file.created_at || new Date().toISOString(),
      };
    });
  }
}
