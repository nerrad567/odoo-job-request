odoo.define('electrical_job_request.file_utils', ['@web/core/network/rpc'], function (require) {
    'use strict';

    const { rpc } = require('@web/core/network/rpc');

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

    async function handleMultiFileChange(ev, index, key, allowedTypes, state) {
        const files = Array.from(ev.target.files);
        const validFiles = await Promise.all(files.filter(file => allowedTypes.includes(file.type)).map(async file => {
            let thumbnail = null;
            if (file.type.startsWith('image/')) {
                thumbnail = await getThumbnail(file);
            }
            return { name: file.name, type: file.type, size: file.size, file, thumbnail, status: 'pending', progress: 0 };
        }));
        state.socket_lines[index][key].push(...validFiles);
    }

    async function uploadFile(fileObj, updateProgressCallback) {
        const presigned = await rpc('/job-request/presigned-url', {
            file_name: fileObj.name,
            file_type: fileObj.type
        });
        if (presigned.status !== 'success') throw new Error(presigned.message);

        return new Promise((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('PUT', presigned.data.url, true);
            xhr.setRequestHeader('Content-Type', fileObj.type);

            xhr.upload.onprogress = (e) => {
                if (e.lengthComputable) {
                    fileObj.progress = Math.round((e.loaded / e.total) * 100);
                    if (updateProgressCallback) updateProgressCallback();
                }
            };

            xhr.onload = () => {
                if (xhr.status === 200) {
                    fileObj.status = 'uploaded';
                    fileObj.progress = 100;
                    if (updateProgressCallback) updateProgressCallback();
                    resolve({ name: fileObj.name, type: fileObj.type, s3_key: presigned.data.s3_key });
                } else {
                    fileObj.status = 'error';
                    reject(new Error('Upload failed'));
                }
            };

            xhr.onerror = () => reject(new Error('Upload error'));

            xhr.send(fileObj.file);
        });
    }

    return {
        getThumbnail,
        handleSingleFileChange,
        handleMultiFileChange,
        uploadFile,
    };
});