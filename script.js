const Peer = window.Peer;

(async function main() {
    const localVideo = document.getElementById('js-local-video');
    const localId = document.getElementById('js-local-id');
    const remoteVideo = document.getElementById('js-remote-video');
    const remoteId = document.getElementById('js-remote-id');
    const connectedId = document.getElementById('js-connected-id');
    const callTrigger = document.getElementById('js-call-trigger');
    const closeTrigger = document.getElementById('js-close-trigger');

    const localStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        video: { facingMode: 'user' }, // ‰t»‘¤‚ÌƒJƒƒ‰
        audio: true,
    });

    

    localVideo.srcObject = localStream;

    localVideo.setAttribute("playsinline", true);
    localVideo.setAttribute("autoplay", true);
    localVideo.setAttribute("muted", true);

    localVideo.play();
    
    
    const peer = new Peer({
        key: 'ae5dd772-2e2c-40a3-867d-2721990285b8',
        debug: 3,
    });

    peer.on('open', (id) => {
        localId.textContent = id;
    });

    peer.on('call', mediaConnection => {
        mediaConnection.answer(localStream);
        connectedId.textContent = mediaConnection.remoteId;

        mediaConnection.on('stream', stream => {
            remoteVideo.srcObject = stream;
        });

        mediaConnection.once('close', () => {
            remoteVideo.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            remoteVideo.srcObject = null;
            connectedId.textContent = '...';
        });

        closeTrigger.addEventListener('click', () => {
            mediaConnection.close(true);
        });
    });

    callTrigger.addEventListener('click', () => {
        const mediaConnection = peer.call(remoteId.value, localStream);
        connectedId.textContent = mediaConnection.remoteId;

        mediaConnection.on('stream', stream => {
            remoteVideo.srcObject = stream;
        });

        mediaConnection.once('close', () => {
            remoteVideo.srcObject.getTracks().forEach(track => {
                track.stop();
            });
            remoteVideo.srcObject = null;
            connectedId.textContent = '...';
        });

        closeTrigger.addEventListener('click', () => {
            mediaConnection.close(true);
        });
    });

    peer.on('error', console.error);
})();

let localStream = null;
let peer = null;
let existingCall = null;

navigator.mediaDevices.getUserMedia({ video: true, audio: true })
    .then(function (stream) {
        $('#myStream').get(0).srcObject = stream;
        localStream = stream;
    }).catch(function (error) {
        console.error('mediaDevice.getUserMedia() error:', error);
        return;
    });

peer = new Peer({
    key: 'ae5dd772-2e2c-40a3-867d-2721990285b8',
    debug: 3
});

peer.on('open', function () {
    $('#my-id').text(peer.id);
});

peer.on('call', function (call) {
    call.answer(localStream);
    setupCallEventHandlers(call);
});

peer.on('error', function (err) {
    alert(err.message);
});

$('#make-call').submit(function (e) {
    e.preventDefault();
    const call = peer.call($('#peer-id').val(), localStream);
    setupCallEventHandlers(call);
});

$('#end-call').click(function () {
    existingCall.close();
});

function setupCallEventHandlers(call) {
    if (existingCall) {
        existingCall.close();
    };

    existingCall = call;

    call.on('stream', function (stream) {
        addVideo(call, stream);
        setupEndCallUI();
        $('#connected-peer-id').text(call.remoteId);
    });

    call.on('close', function () {
        removeVideo(call.remoteId);
        setupMakeCallUI();
    });
}


function addVideo(call, stream) {
    const videoDom = $('<video autoplay>');
    videoDom.attr('id', call.remoteId);
    videoDom.get(0).srcObject = stream;
    $('.videosContainer').append(videoDom);
}

function removeVideo(peerId) {
    $('#' + peerId).remove();
}

function setupMakeCallUI() {
    $('#make-call').show();
    $('#end-call').hide();
}

function setupEndCallUI() {
    $('#make-call').hide();
    $('#end-call').show();
}