import { env } from "@/lib/env";

async function postAudio(pathname: string, file: File) {
  const formData = new FormData();
  formData.set("file", file, file.name);

  const response = await fetch(`${env.aiServiceBaseUrl}${pathname}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`AI service failed: ${response.status} ${errorText}`);
  }

  return response.json();
}

export async function processCheckin(file: File) {
  return postAudio("/process-checkin/", file);
}

export async function analyzeAudio(file: File) {
  return postAudio("/analyze-audio/", file);
}
