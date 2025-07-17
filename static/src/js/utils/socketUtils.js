// static/src/js/utils/socketUtils.js
function createSocketLine() {
    return {
        room_name: '',
        socket_style: '',
        installation_height_from_floor: 0,
        mount_type: '',
        flooring_type: '',
        flooring_other_description: '',
        wall_type: '',
        number_of_gangs: '',
        estimated_usage: '',
        comments: '',
        location_photo_attachments: [],
        route_photo_or_video_attachments: []
    };
}

export function prepopulateSockets(state) {
    state.new_socket_installations = Array.from({ length: parseInt(state.num_sockets) || 1 }, createSocketLine);
}

export function addSocketLine(state) {
    state.new_socket_installations.push(createSocketLine());
}

export function removeSocketLine(state, index) {
    if (state.new_socket_installations.length > 1) {
        state.new_socket_installations.splice(index, 1);
    }
}