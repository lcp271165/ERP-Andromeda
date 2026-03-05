// Main JavaScript file for Andromeda Website

document.addEventListener('DOMContentLoaded', () => {
    console.log('Andromeda Website Loaded');
    heroCarousel.init();
    initTheme(); // Initialize theme on load
});

/* --- Theme Logic --- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (savedTheme === 'light') {
        document.body.classList.remove('dark-mode');
    } else {
        // System preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }
}

window.setTheme = function (theme) {
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
        document.body.classList.add('dark-mode');
    } else if (theme === 'light') {
        document.body.classList.remove('dark-mode');
    } else {
        // System preference logic
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    // Dispatch event for UI updates if needed
    window.dispatchEvent(new Event('themeChanged'));
};

/* --- Access Control & Admin Panel Logic --- */
const USERS_KEY = 'andromeda_users';
const CURRENT_USER_KEY = 'andromeda_current_user';

// Default Users
const defaultUsers = [
    { username: 'admin', role: 'Administrador Maestro', permissions: ['all'] },
    { username: 'gerente', role: 'Gerente General', permissions: ['utilitarios', 'erp'] },
    { username: 'invitado', role: 'Invitado', permissions: [] }
];

// Initialize Logic
(function initAccessControl() {
    // Ensure users exist
    if (!localStorage.getItem(USERS_KEY)) {
        localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    }

    // Check permissions on page load
    checkPermissions();

    // Render Admin Panel if on config page
    if (window.location.pathname.includes('configuracion.html')) {
        renderUserTable();
        populateSimulator();
        updateSimulationStatus();
    }
})();

function checkPermissions() {
    const path = window.location.pathname;
    const currentUser = JSON.stringify(localStorage.getItem(CURRENT_USER_KEY)); // Fix: just getItem
    const user = getUser(localStorage.getItem(CURRENT_USER_KEY));

    // Define Paths and Required Permissions
    // No permission needed for index, contacts, config (Config protects its own admin section)

    let required = null;
    // if (path.includes('/corporativo/')) required = 'corporativo'; // Corporativo es público ahora
    if (path.includes('/utilitarios/')) required = 'utilitarios'; // General utilitarios
    if (path.includes('erp_andromeda.html')) required = 'erp'; // Specific override if needed, or included in utilitarios

    // If no requirement, return
    if (!required) return;

    // Check User
    if (!user) {
        // No user logged in? For demo, maybe default to 'invitado' or restrictive
        // Let's assume 'invitado' is default if nothing set? 
        // Or redirect to config to "login" (Simulate)
        // For this demo, let's warn and redirect.
        // BUT, to avoid blocking the user immediately on first load, lets define a 'guest' implicitly if null.
        // Actually, let's just alert if access denied.
        alert('Acceso Restringido: Debe seleccionar un usuario con permisos para acceder a esta área. (Vaya a Configuración)');
        window.location.href = path.split('/pages')[0] + '/index.html'; // Go Home
        return;
    }

    if (user.permissions.includes('all')) return; // Admin

    if (!user.permissions.includes(required)) {
        alert(`Acceso Denegado: El usuario '${user.username}' no tiene permisos para el área de ${required}.`);
        window.history.back();
    }
}

function getUser(username) {
    if (!username) return null;
    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    return users.find(u => u.username === username);
}

/* --- Admin Panel Functions --- */

function loginAdmin() {
    const pass = document.getElementById('admin-password').value;
    const errorMsg = document.getElementById('login-error');
    const panel = document.getElementById('admin-dashboard');
    const loginPanel = document.getElementById('admin-login-panel');

    if (pass === 'admin123') {
        loginPanel.style.display = 'none';
        panel.style.display = 'block';
        errorMsg.style.display = 'none';
    } else {
        errorMsg.style.display = 'block';
    }
}

function logoutAdmin() {
    document.getElementById('admin-dashboard').style.display = 'none';
    document.getElementById('admin-login-panel').style.display = 'block';
    document.getElementById('admin-password').value = '';
}

function addUser() {
    const username = document.getElementById('new-username').value;
    const role = document.getElementById('new-user-role').value;

    if (!username || !role) {
        alert('Por favor complete el nombre y el rol.');
        return;
    }

    const perms = [];
    if (document.getElementById('perm-corp').checked) perms.push('corporativo');
    if (document.getElementById('perm-util').checked) perms.push('utilitarios');
    if (document.getElementById('perm-erp').checked) perms.push('erp');

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    users.push({ username, role, permissions: perms });
    localStorage.setItem(USERS_KEY, JSON.stringify(users));

    // Clear inputs
    document.getElementById('new-username').value = '';
    document.getElementById('new-user-role').value = '';
    document.querySelectorAll('input[type=checkbox]').forEach(c => c.checked = false);

    renderUserTable();
    populateSimulator();
}

function deleteUser(username) {
    let users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    users = users.filter(u => u.username !== username);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    renderUserTable();
    populateSimulator();
}

function renderUserTable() {
    const tbody = document.getElementById('user-table-body');
    if (!tbody) return;

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    tbody.innerHTML = '';

    users.forEach(user => {
        const tr = document.createElement('tr');
        tr.style.backgroundColor = 'var(--bg-white)';
        tr.style.borderBottom = '1px solid #eee';

        tr.innerHTML = `
            <td style="padding: 10px;">${user.username}</td>
            <td style="padding: 10px;">${user.role}</td>
            <td style="padding: 10px;">${user.permissions.includes('all') ? '<strong>ACCESO TOTAL</strong>' : user.permissions.join(', ')}</td>
            <td style="padding: 10px;">
                ${user.username !== 'admin' ?
                `<button onclick="deleteUser('${user.username}')" style="color: red; border: none; background: none; cursor: pointer;"><i class="fas fa-trash"></i></button>` :
                ''}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function populateSimulator() {
    const select = document.getElementById('user-simulator-select');
    if (!select) return;

    const users = JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
    // Keep header
    select.innerHTML = '<option value="">-- Seleccionar Usuario --</option>';

    users.forEach(u => {
        const option = document.createElement('option');
        option.value = u.username;
        option.textContent = `${u.username} (${u.role})`;
        select.appendChild(option);
    });

    // Set current if any
    const current = localStorage.getItem(CURRENT_USER_KEY);
    if (current) select.value = current;
}

function simulateUser() {
    const select = document.getElementById('user-simulator-select');
    const username = select.value;

    if (username) {
        localStorage.setItem(CURRENT_USER_KEY, username);
    } else {
        localStorage.removeItem(CURRENT_USER_KEY);
    }
    updateSimulationStatus();
}

function updateSimulationStatus() {
    const current = localStorage.getItem(CURRENT_USER_KEY);
    const display = document.getElementById('current-simulation');
    if (display) {
        if (current) {
            display.textContent = `Navegando como: ${current}`;
            display.style.color = 'green';
        } else {
            display.textContent = 'No hay usuario activo (Acceso limitado)';
            display.style.color = 'orange';
        }
    }
}


/* --- Hero Carousel Logic --- */
const heroCarousel = {
    track: null,
    slides: [],
    prevBtn: null,
    nextBtn: null,
    currentIndex: 0,
    interval: null,

    init: function () {
        this.track = document.getElementById('hero-track');
        if (!this.track) return;

        this.slides = Array.from(this.track.children);
        this.prevBtn = document.getElementById('hero-prev');
        this.nextBtn = document.getElementById('hero-next');

        if (this.prevBtn) this.prevBtn.addEventListener('click', () => {
            this.stopAutoPlay();
            this.move(-1);
            this.startAutoPlay();
        });

        if (this.nextBtn) this.nextBtn.addEventListener('click', () => {
            this.stopAutoPlay();
            this.move(1);
            this.startAutoPlay();
        });

        this.startAutoPlay();
    },

    move: function (direction) {
        if (this.slides.length === 0) return;

        this.slides[this.currentIndex].classList.remove('current-slide');

        this.currentIndex += direction;
        if (this.currentIndex >= this.slides.length) {
            this.currentIndex = 0;
        } else if (this.currentIndex < 0) {
            this.currentIndex = this.slides.length - 1;
        }

        this.slides[this.currentIndex].classList.add('current-slide');
    },

    startAutoPlay: function () {
        this.interval = setInterval(() => this.move(1), 5000); // 5 seconds
    },

    stopAutoPlay: function () {
        if (this.interval) clearInterval(this.interval);
    }
};

/* --- Project Gallery Logic --- */
// ... existing code ...
const projectsData = {
    'project1': {
        title: 'Residencial Altos de Andrómeda',
        images: [
            '../../assets/images/logo_full.jpg', // Placeholder
            '../../assets/images/logo_icon.jpg', // Placeholder
            '../../assets/images/logo_full.jpg'  // Placeholder
        ]
    },
    'project2': {
        title: 'Centro Corporativo Norte',
        images: [
            '../../assets/images/logo_icon.jpg',
            '../../assets/images/logo_full.jpg'
        ]
    },
    'project3': {
        title: 'Puente La Unión',
        images: [
            '../../assets/images/logo_full.jpg'
        ]
    },
    'antamina': {
        title: 'Proyectos Antamina',
        images: [
            '../../Imágenes/Antamina 2013 (16).JPG',
            '../../Imágenes/Antamina 2013 (30).JPG',
            '../../Imágenes/Antamina 2013 (32).JPG',
            '../../Imágenes/Antamina 2013 (33).JPG'
        ]
    }
};

let currentSlideIndex = 0;
let currentProjectImages = [];

function openProject(projectId) {
    const project = projectsData[projectId];
    if (!project) return;

    // Hide Grid, Show View
    const grid = document.getElementById('projects-grid');
    const view = document.getElementById('project-view');
    const title = document.getElementById('project-title');

    if (grid) grid.style.display = 'none';
    if (view) view.style.display = 'block';

    // Set Title
    if (title) title.innerText = project.title;

    // Setup Carousel
    currentProjectImages = project.images;
    currentSlideIndex = 0;
    renderCarousel();
}

function closeProject() {
    const grid = document.getElementById('projects-grid');
    const view = document.getElementById('project-view');

    if (view) view.style.display = 'none';
    if (grid) grid.style.display = 'grid';
}

/* --- Carousel Logic (Project Gallery) --- */

function renderCarousel() {
    const track = document.getElementById('carousel-track');
    if (!track) return;

    track.innerHTML = ''; // Clear existing

    currentProjectImages.forEach((imgSrc, index) => {
        const li = document.createElement('li');
        li.classList.add('carousel-slide');
        if (index === 0) li.classList.add('current-slide');

        const img = document.createElement('img');
        img.src = imgSrc;
        img.alt = `Slide ${index + 1}`;
        img.onclick = () => openLightbox(imgSrc); // Click to open lightbox

        li.appendChild(img);
        track.appendChild(li);
    });
}

function moveCarousel(direction) {
    // Note: This matches ANY .carousel-slide, which might interact with hero carousel if not careful.
    // Ideally we'd scope this. But for now, let's just make sure we target the project carousel slides if possible.
    // Or just scoped by 'carousel-track' ID if we were doing it right.
    // For now, let's just assume this is only called when Project View is open.
    // To be safe, let's select purely based on the active modal or something.
    // But actually, 'hero-carousel' slides also have class 'carousel-slide'.
    // `document.querySelectorAll('.carousel-slide')` WILL pick up hero slides!

    // FIX: Scope to #carousel-track
    const track = document.getElementById('carousel-track');
    if (!track) return;

    const slides = track.querySelectorAll('.carousel-slide');
    if (slides.length === 0) return;

    // Hide current
    slides[currentSlideIndex].classList.remove('current-slide');

    // Calculate new index
    currentSlideIndex += direction;
    if (currentSlideIndex >= slides.length) {
        currentSlideIndex = 0;
    } else if (currentSlideIndex < 0) {
        currentSlideIndex = slides.length - 1;
    }

    // Show new
    slides[currentSlideIndex].classList.add('current-slide');
}

/* --- Lightbox Logic --- */

function openLightbox(imgSrc) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');

    if (!lightbox || !lightboxImg) return;

    lightbox.style.display = 'block';
    lightboxImg.src = imgSrc;
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) lightbox.style.display = 'none';
}

// Close lightbox when clicking outside the image
window.onclick = function (event) {
    const lightbox = document.getElementById('lightbox');
    if (event.target == lightbox) {
        lightbox.style.display = 'none';
    }
}
