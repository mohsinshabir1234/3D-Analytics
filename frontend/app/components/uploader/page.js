"use client"
import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import {useState} from 'react'
function MyDropzone() {
const [files,setFiles] = useState()
  const onDrop = useCallback(acceptedFiles => {
    console.log("Files dropped:", acceptedFiles);
    // Do something with the files
    if (acceptedFiles.length>0) setFiles(acceptedFiles[0]); //Make sure ACcepted files is just one file that is being uploaded
    console.log(acceptedFiles[0]);
  }, [])
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop})
  const formData = new FormData();
  formData.append('file',files);  
  fetch('/api/upload', {
    method: 'POST',
    body: formData,})
    .then(response => response.json()) 
    .then(data => {
      console.log('Success:', data);
    })
    .catch((error) => {
      console.error('Error:', error);
    });
    console.log("Files uploaded successfully");

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {
        isDragActive ?
          <p>Drop the files here ...</p> :
          <p>Drag 'n' drop some files here, or click to select files</p>
      }
    </div>
  )
}
export default function Uploader() {
    return (
        <div>
            <h2>File Uploader</h2>
            <MyDropzone />
        </div>
    )
}