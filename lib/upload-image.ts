import { apiFetch } from "@/lib/api";

export async function uploadImage(file: File) {
  if (!file.type.startsWith("image/") || file.size > 6 * 1024 * 1024) {
    throw new Error("Choose an image under 6 MB.");
  }
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Could not read image."));
    reader.readAsDataURL(file);
  });
  const result = await apiFetch<{ url: string }>("/uploads", {
    method: "POST",
    body: JSON.stringify({ image: base64 }),
  });
  return result.url;
}
