// static/src/js/utils/submitUtils.js
export function collectPendingFiles(state, headerKeys) {
    const fileSources = [
        ...headerKeys.map(key => ({ key, files: state[key] ? [state[key]] : [], isArray: false })),
        { key: 'general_site_video_attachments', files: state.general_site_video_attachments, isArray: true },
        { key: 'unknown_attachment', files: state.unknown_attachment ? [state.unknown_attachment] : [], isArray: false },
        ...state.new_socket_installations.flatMap(line => [
            { key: 'location_photo_attachments', files: line.location_photo_attachments, isArray: true },
            { key: 'route_photo_or_video_attachments', files: line.route_photo_or_video_attachments, isArray: true },
        ]),
    ];
    const allPendingFiles = fileSources.flatMap(source => source.files.filter(f => f.status === 'pending'));
    const totalUploadSize = allPendingFiles.reduce((sum, f) => sum + (f.size || 0), 0);
    return { allPendingFiles, totalUploadSize };
}

export async function getMetadata(files, isArray, uploadFile, updateUploadProgress) {
    if (isArray) {
        return Promise.all(files.map(async f => f.status === 'pending' ? await uploadFile(f, updateUploadProgress) : { id: f.id, name: f.name, type: f.type || 'application/octet-stream', s3_key: f.s3_key }));
    } else if (files.length) {
        const f = files[0];
        return f.status === 'pending' ? await uploadFile(f, updateUploadProgress) : { id: f.id, name: f.name, type: f.type || 'application/octet-stream', s3_key: f.s3_key };
    }
    return null;
}

export function updateUploadProgress(state, allPendingFiles, totalUploadSize) {
    if (totalUploadSize === 0) {
        state.uploadProgress = 100;
        return;
    }
    let uploadedBytes = 0;
    allPendingFiles.forEach(f => {
        uploadedBytes += (f.progress / 100) * (f.size || 0);
    });
    state.uploadProgress = Math.round((uploadedBytes / totalUploadSize) * 100);
}

export async function buildFormData(state, headerKeys, getMetadata) {
    const headerMetadata = {};
    for (const key of headerKeys) {
        headerMetadata[key] = await getMetadata(state[key] ? [state[key]] : [], false);
    }

    const socketMetadata = await Promise.all(state.new_socket_installations.map(async line => ({
        location_photo_attachments: await getMetadata(line.location_photo_attachments, true),
        route_photo_or_video_attachments: await getMetadata(line.route_photo_or_video_attachments, true),
    })));

    const generalVideoMetadata = await getMetadata(state.general_site_video_attachments, true);
    const unknownMetadata = await getMetadata(state.unknown_attachment ? [state.unknown_attachment] : [], false);

    return {
        first_name: state.first_name,
        email: state.email,
        mobile: state.mobile,
        postcode: state.postcode,
        job_type: state.job_type,
        additional_notes: state.additional_notes,
        building_type: state.building_type,
        construction_age: state.construction_age,
        attic_access_availability: state.attic_access_availability,
        electrical_panel_type: state.electrical_panel_type,
        recent_electrical_upgrades: state.recent_electrical_upgrades,
        ...headerMetadata,
        water_is_present: state.water_is_present,
        water_installation_location: state.water_installation_location,
        gas_is_present: state.gas_is_present,
        gas_installation_location: state.gas_installation_location,
        oil_is_present: state.oil_is_present,
        oil_installation_location: state.oil_installation_location,
        other_services_is_present: state.other_services_is_present,
        other_services_description: state.other_services_description,
        new_socket_installations: state.new_socket_installations.map((line, i) => ({
            room_name: line.room_name,
            socket_style: line.socket_style,
            installation_height_from_floor: line.installation_height_from_floor,
            mount_type: line.mount_type,
            flooring_type: line.flooring_type,
            flooring_other_description: line.flooring_other_description,
            wall_type: line.wall_type,
            number_of_gangs: line.number_of_gangs,
            estimated_usage: line.estimated_usage,
            comments: line.comments,
            location_photo_attachments: socketMetadata[i].location_photo_attachments,
            route_photo_or_video_attachments: socketMetadata[i].route_photo_or_video_attachments,
        })),
        general_site_video_attachments: generalVideoMetadata,
        unknown_attachment: unknownMetadata,
        power_rating: state.power_rating,
        installation_location: state.installation_location,
        ev_comments: state.ev_comments,
        ev_attachments: await getMetadata(state.ev_attachments, true),
    };
}