"use server";

import { createClient } from "@/utils/supabase/server";

export async function uploadFile(file: File | Blob, path: string, bucketName: string) {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase.storage.from(bucketName).upload(path, file, {
      upsert: false,
    });

    if (error) {
      throw new Error(error.message);
    }

    return { data, success: true, message: "File uploaded successfully" };
  } catch (error) {
    return{
        data: null,
        success: false,
        message: error instanceof Error ? error.message : "An unknown error occurred",
    }
  }
}



