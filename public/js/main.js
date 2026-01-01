document.addEventListener('DOMContentLoaded', () => {
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.querySelector('.sidebar-wrapper');

    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            sidebar.classList.toggle('show');
        });

        // Close sidebar when clicking outside on mobile
        document.addEventListener('click', (e) => {
            if (window.innerWidth < 992 &&
                sidebar.classList.contains('show') &&
                !sidebar.contains(e.target) &&
                e.target !== sidebarToggle) {
                sidebar.classList.remove('show');
            }
        });

        // Prevent closing when clicking inside sidebar
        sidebar.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    // Dark Mode Logic
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;

    // Check saved preference
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    updateIcon(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';

            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
            updateIcon(newTheme);
        });
    }

    function updateIcon(theme) {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('i');
        if (theme === 'dark') {
            icon.classList.remove('bi-moon-fill');
            icon.classList.add('bi-sun-fill');
        } else {
            icon.classList.remove('bi-sun-fill');
            icon.classList.add('bi-moon-fill');
        }
    }

    // Real-time Search
    const searchInput = document.getElementById('searchInput');
    const tasksContainer = document.getElementById('tasks-container');
    const searchToggle = document.getElementById('searchToggle');
    const searchContainer = document.getElementById('searchContainer');
    let timeout = null;

    if (searchToggle && searchContainer) {
        searchToggle.addEventListener('click', (e) => {
            e.preventDefault();
            searchContainer.classList.toggle('d-none');
            if (!searchContainer.classList.contains('d-none')) {
                searchInput.focus();
            }
        });
    }

    if (searchInput && tasksContainer) {
        console.log('Search initialized');
        searchInput.addEventListener('input', function () {
            console.log('Input event:', this.value);
            clearTimeout(timeout);
            const query = this.value;

            timeout = setTimeout(async () => {
                console.log('Fetching:', query);
                try {
                    const res = await fetch(`/tasks/search?q=${encodeURIComponent(query)}`);
                    if (res.ok) {
                        const html = await res.text();
                        tasksContainer.innerHTML = html;
                    } else {
                        console.error('Server error:', res.status);
                        tasksContainer.innerHTML = `<div class="text-center py-5 text-danger"><i class="bi bi-exclamation-triangle fs-1"></i><p class="mt-2">Search failed (Status ${res.status}). please try again.</p></div>`;
                    }
                } catch (e) {
                    console.error('Network error', e);
                    tasksContainer.innerHTML = `<div class="text-center py-5 text-danger"><i class="bi bi-wifi-off fs-1"></i><p class="mt-2">Network error. check your connection.</p></div>`;
                }
            }, 300); // 300ms debounce
        });
    }
});
