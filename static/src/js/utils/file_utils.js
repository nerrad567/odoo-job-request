/** @odoo-module **/
// static/src/js/utils/file_utils.js
import { rpc } from "@web/core/network/rpc";

async function getThumbnail(file) {
    return new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.readAsDataURL(file);
    });
}

async function handleSingleFileChange(ev, key, state) {
    const file = ev.target.files[0];
    if (!file) return;
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
        state.message = `Invalid file type for ${key}.`;
        state.messageType = 'alert-danger';
        return;
    }
    // Size checks can be added here if needed
    let thumbnail = await getThumbnail(file);
    state[key] = { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
}

async function handleMultiFileChange(ev, lineIndex, key, allowedTypes, state) {
    const files = Array.from(ev.target.files);
    const validFiles = await Promise.all(files.filter(file => allowedTypes.includes(file.type)).map(async file => {
        let thumbnail = null;
        if (file.type.startsWith('image/')) {
            thumbnail = await getThumbnail(file);
        }
        return { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
    }));
    const target = lineIndex !== null ? state.new_socket_installations[lineIndex][key] : state[key];
    target.push(...validFiles);
}

async function uploadFile(fileObj, updateProgressCallback) {
    const presigned = await rpc('/job-request/presigned-url', {
        file_name: fileObj.name,
        file_type: fileObj.type
    });
    if (presigned.status !== 'success') {
        console.error('Presigned URL failed:', presigned.message);
        throw new Error(presigned.message || 'Presigned URL error');
    }

    // Create sliced Blob to detach metadata
    let fileToSend = fileObj.file;
    try {
        fileToSend = fileObj.file.slice(0, fileObj.file.size, fileObj.file.type);
        console.log('Sliced Blob created successfully for upload');
    } catch (error) {
        console.error('Slice failed—falling back to original:', error);
    }

    // Use fetch instead of XHR for upload
    const response = await fetch(presigned.data.url, {
        method: 'PUT',
        headers: {
            'Content-Type': fileObj.type
        },
        body: fileToSend,
        mode: 'cors'  // Ensure CORS if needed
    });

    if (response.ok) {
        fileObj.status = 'uploaded';
        fileObj.progress = 100;
        if (updateProgressCallback) updateProgressCallback();
        return { name: fileObj.name, type: fileObj.type, s3_key: presigned.data.s3_key };
    } else {
        const errorText = await response.text();
        console.error('Fetch upload failed:', response.status, errorText);
        throw new Error(`Upload failed: ${response.status} - ${errorText || 'No response'}`);
    }
}


export { getThumbnail, handleSingleFileChange, handleMultiFileChange, uploadFile };