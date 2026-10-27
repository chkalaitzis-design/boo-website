// ---- Right-click / devtools protection (shared across all pages) ----
function showToast() {
    const toast = document.getElementById('rightClickToast');
    if (!toast) return;
    toast.style.display = 'flex';
    setTimeout(() => toast.style.display = 'none', 2200);
}

document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    showToast();
    return false;
});

document.addEventListener('keydown', function (e) {
    if (e.ctrlKey || e.metaKey) {
        if (['u', 's', 'p', 'i', 'j', 'c'].includes(e.key.toLowerCase()) ||
            (e.shiftKey && e.key === 'I')) {
            e.preventDefault();
            showToast();
            return false;
        }
    }
    if (e.key === 'F12') {
        e.preventDefault();
        showToast();
        return false;
    }
    if (e.key === 'Escape') {
        exitTheater();
    }
});

// ---- Fullscreen / theater helpers ----
function toEmbedUrl(url, autoplay) {
    let next = String(url || '').replace('/play/', '/embed/');
    next = next.replace(/[?&]autoplay=(true|false)/g, '');
    const join = next.includes('?') ? '&' : '?';
    return next + join + (autoplay ? 'autoplay=true' : 'autoplay=false');
}

function requestNativeFullscreen(el) {
    if (!el) return Promise.reject();
    if (el.requestFullscreen) return el.requestFullscreen();
    if (el.webkitRequestFullscreen) return el.webkitRequestFullscreen();
    if (el.mozRequestFullScreen) return el.mozRequestFullScreen();
    if (el.msRequestFullscreen) return el.msRequestFullscreen();
    return Promise.reject();
}

function enterTheater(wrapper) {
    exitTheater();
    if (!wrapper) return;
    wrapper.classList.add('theater');
    document.body.classList.add('theater-open');
}

function exitTheater() {
    document.querySelectorAll('.video-wrapper.theater').forEach((el) => {
        el.classList.remove('theater');
    });
    document.body.classList.remove('theater-open');
    if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
    }
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        document.querySelectorAll('.video-wrapper.theater').forEach((el) => {
            el.classList.remove('theater');
        });
        document.body.classList.remove('theater-open');
    }
});

// ---- Video grid rendering (used on period-N.html pages) ----
function createVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'bg-zinc-900 rounded-3xl overflow-hidden cursor-pointer';

    const playUrl = toEmbedUrl(video.url, true);
    const safeTitle = String(video.title || '').replace(/"/g, '&quot;');

    card.innerHTML = `
        <div class="aspect-video bg-black video-wrapper relative">
            <button type="button" class="theater-close" aria-label="Close fullscreen">&times;</button>
            <div class="video-placeholder absolute inset-0 flex items-center justify-center bg-zinc-950 z-20">
                <div class="text-center pointer-events-none">
                    <i class="fas fa-play-circle text-6xl text-orange-500"></i>
                    <p class="mt-3 text-sm text-zinc-400">Tap to play fullscreen</p>
                </div>
            </div>
            <iframe src=""
                    data-src="${playUrl}"
                    title="${safeTitle}"
                    class="w-full h-full"
                    allowfullscreen
                    webkitallowfullscreen
                    mozallowfullscreen
                    frameborder="0"
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                    allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen"
                    oncontextmenu="return false;"></iframe>
        </div>
        <div class="p-5">
            <h3 class="font-semibold">${safeTitle}</h3>
        </div>
    `;

    const placeholder = card.querySelector('.video-placeholder');
    const closeBtn = card.querySelector('.theater-close');

    placeholder.addEventListener('click', () => loadVideo(placeholder, playUrl));
    closeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        exitTheater();
    });

    return card;
}

function loadVideo(placeholder, url) {
    const wrapper = placeholder.parentElement;
    const iframe = wrapper.querySelector('iframe');

    iframe.setAttribute('allow', 'accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture; fullscreen');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.src = url;
    placeholder.style.display = 'none';

    enterTheater(wrapper);
    requestNativeFullscreen(wrapper).catch(() => {
        // iPhone and some mobile browsers block iframe fullscreen.
        // Theater CSS already covers the whole screen.
    });
}

function renderVideos(gridId, videos) {
    const grid = document.getElementById(gridId);
    if (!grid) return;
    grid.innerHTML = '';
    videos.forEach((video) => grid.appendChild(createVideoCard(video)));
}
