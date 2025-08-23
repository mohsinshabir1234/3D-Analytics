// Import necessary modules
import { NextResponse } from "next/server";
import path from "path";
import { writeFile } from "fs/promises";
import { logFileQueue } from "../../backend/queues/queue";
// Define the POST handler for the file upload
export const POST = async (req) => {
    console.log("File upload request received");
  // Parse the incoming form data
  const formData = await req.formData();

  // Get the file from the form data
  const file = formData.get("file");

  // Check if a file is received
  if (!file) {
    // If no file is received, return a JSON response with an error and a 400 status code
    return NextResponse.json({ error: "No files received." }, { status: 400 });
  }

  let buffer;

  // Try arrayBuffer first
  if (typeof file.arrayBuffer === "function") {
    buffer = Buffer.from(await file.arrayBuffer());
  } else if (file instanceof Blob) {
    // If it's a Blob but no arrayBuffer, use text fallback (for text files only)
    const text = await file.text();
    buffer = Buffer.from(text);
  } else {
    // Fallback if it's already a Node.js Buffer
    buffer = Buffer.from(file);
  }
  const filename = file.name;
  //here i am enqueuing the file as a job onto the queue
 const job = await logFileQueue.add(
    "logFile",
    {
    location:path.join(process.cwd(),"public/assets/"+filename)},
  {removeOnComplete:true,removeOnFail:true},
)
  console.log("This is logfile queue",job.id,job.data.location)
  try {
    // Write the file to the specified directory (public/assets) with the modified filename
    await writeFile(
      path.join(process.cwd(), "public/assets/" + filename),
      buffer
    );

    // Return a JSON response with a success message and a 201 status code
    return NextResponse.json({ Message: "Success", status: 201 });
  } catch (error) {
    // If an error occurs during file writing, log the error and return a JSON response with a failure message and a 500 status code
    console.log("Error occurred ", error);
    return NextResponse.json({ Message: "Failed", status: 500 });
  }
};