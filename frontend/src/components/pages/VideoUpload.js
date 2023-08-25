import React, { Component, useState } from 'react';

const VideoUpload = () => {
    const [file, setFile] = useState(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        setFile(selectedFile);
    };

    const handleUploadSuccessful = () => {
        alert('File uploaded successfully!');
        setIsUploading(false);
    }

    const handleUploadFail = () => {
        alert('File upload failed.');
        setIsUploading(false);
    } 

    const handleUploadAbort = () => {
        alert('File upload was aborted.');
        setIsUploading(false);
    } 

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!file) {
            alert('Please select a file to upload.');
            return;
        }

        setIsUploading(true);

        var formdata = new FormData();
        formdata.append("file", file);
        // TODO Include the video id in the request, so that the server can send it back when ask for that
        // particular id
        var request = new XMLHttpRequest();
        request.addEventListener("load", handleUploadSuccessful, false);
        request.addEventListener("error", handleUploadFail, false);
        request.addEventListener("abort", handleUploadAbort, false);
        request.open("POST", "/api/upload"); // http://www.developphp.com/video/JavaScript/File-Upload-Progress-Bar-Meter-Tutorial-Ajax-PHP
        console.log(request);

        request.upload.onprogress = function(event) {
            const progress = Math.round((event.loaded / event.total) * 100);
            setUploadProgress(progress);
            console.log("Uploaded " + event.loaded + " bytes of " + event.total)
        }

        request.send(formdata);
    };

    return (
        <div>
            <h2>File Upload</h2>
            <form onSubmit={handleSubmit}>
                <input type="file" onChange={handleFileChange} />
                <button type="submit" disabled={isUploading}>
                    Upload
                </button>
            </form>
            {isUploading && (
                <div>
                    <p>Uploading: {uploadProgress}%</p>
                    <progress max="100" value={uploadProgress}></progress>
                </div>
            )}
        </div>
    )
}

export default VideoUpload;