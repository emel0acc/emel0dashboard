document.addEventListener('DOMContentLoaded', function() {
    // Initialize Supabase client
    const supabaseUrl = "https://fqufsdzxfpskjkuyirpy.supabase.co";
    const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxdWZzZHp4ZnBza2prdXlpcnB5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwODgxNzQsImV4cCI6MjA3ODY2NDE3NH0.CNOmmFogtA_1o86Uz3zc8Y9eh3O1lVHlbmkeCQWiRpg";
    const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // DOM Elements
    const loginSection = document.getElementById('login-section');
    const dashboardSection = document.getElementById('dashboard-section');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const emailInput = document.getElementById('email-input');
    const passwordInput = document.getElementById('password-input');
    const loginError = document.getElementById('login-error');

    // Release form elements
    const submitReleaseBtn = document.getElementById('submit-release');
    const submitMsg = document.getElementById('submit-msg');

    // Authentication Functions
    async function handleLogin(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            
            return { success: true, data };
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    }

    async function handleLogout() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            
            showLogin();
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    // UI Functions
    function showLogin() {
        loginSection.classList.remove('hidden');
        dashboardSection.classList.add('hidden');
        clearLoginForm();
    }

    function showDashboard() {
        loginSection.classList.add('hidden');
        dashboardSection.classList.remove('hidden');
    }

    function clearLoginForm() {
        emailInput.value = '';
        passwordInput.value = '';
        loginError.textContent = '';
    }

    function showLoginError(message) {
        loginError.textContent = message;
    }

    function setLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.textContent = 'Loading...';
            button.classList.add('btn-loading');
        } else {
            button.disabled = false;
            button.textContent = 'Login';
            button.classList.remove('btn-loading');
        }
    }

    // Event Listeners
    loginBtn.addEventListener('click', async () => {
        const email = emailInput.value.trim();
        const password = passwordInput.value;

        if (!email || !password) {
            showLoginError('Please enter both email and password');
            return;
        }

        setLoading(loginBtn, true);
        const result = await handleLogin(email, password);
        setLoading(loginBtn, false);

        if (result.success) {
            showDashboard();
        } else {
            showLoginError(result.error || 'Login failed');
        }
    });

    // Allow login with Enter key
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            loginBtn.click();
        }
    });

    logoutBtn.addEventListener('click', handleLogout);

    // Release Management
    submitReleaseBtn.addEventListener('click', async () => {
        await addRelease();
    });

    async function addRelease() {
        const releaseData = {
            title: document.getElementById('title').value.trim(),
            type: document.getElementById('type').value,
            release_date: document.getElementById('release-date').value,
            description: document.getElementById('description').value.trim(),
            cover_url: document.getElementById('cover-url').value.trim(),
            embed_link: document.getElementById('embed-url').value.trim(),
            spotify_link: document.getElementById('spotify').value.trim(),
            applemusic_link: document.getElementById('apple').value.trim(),
            bandcamp_link: document.getElementById('bandcamp').value.trim(),
            deezer_link: document.getElementById('deezer').value.trim(),
            tidal_link: document.getElementById('tidal').value.trim()
        };

        // Basic validation
        if (!releaseData.title || !releaseData.release_date || !releaseData.cover_url) {
            showMessage('Please fill in required fields: Title, Release Date, and Cover URL', 'error');
            return;
        }

        try {
            setLoading(submitReleaseBtn, true);
            
            const { data, error } = await supabase
                .from('releases')
                .insert([releaseData])
                .select();

            if (error) throw error;

            showMessage('Release added successfully!', 'success');
            clearReleaseForm();
            loadReleases(); // Refresh the list
        } catch (error) {
            console.error('Error adding release:', error);
            showMessage('Failed to add release: ' + error.message, 'error');
        } finally {
            setLoading(submitReleaseBtn, false);
        }
    }

    function showMessage(message, type) {
        submitMsg.textContent = message;
        submitMsg.className = `message ${type}`;
        
        // Auto-hide success messages after 3 seconds
        if (type === 'success') {
            setTimeout(() => {
                submitMsg.textContent = '';
                submitMsg.className = 'message';
            }, 3000);
        }
    }

    function clearReleaseForm() {
        document.getElementById('title').value = '';
        document.getElementById('release-date').value = '';
        document.getElementById('description').value = '';
        document.getElementById('cover-url').value = '';
        document.getElementById('embed-url').value = '';
        document.getElementById('spotify').value = '';
        document.getElementById('apple').value = '';
        document.getElementById('bandcamp').value = '';
        document.getElementById('deezer').value = '';
        document.getElementById('tidal').value = '';
    }

    async function loadReleases() {
        try {
            const { data: releases, error } = await supabase
                .from('releases')
                .select('*')
                .order('release_date', { ascending: false });

            if (error) throw error;

            displayReleases(releases || []);
        } catch (error) {
            console.error('Error loading releases:', error);
        }
    }

    function displayReleases(releases) {
        const releaseList = document.getElementById('release-list');
        
        if (releases.length === 0) {
            releaseList.innerHTML = '<p style="color: rgba(255,255,255,0.6); text-align: center;">No releases yet</p>';
            return;
        }

        releaseList.innerHTML = releases.map(release => `
            <div class="release-item">
                <div class="release-header">
                    <div>
                        <div class="release-title">${release.title}</div>
                        <div class="release-meta">${release.type} • ${new Date(release.release_date).toLocaleDateString()}</div>
                    </div>
                    <div class="release-actions">
                        <button class="btn btn-edit" onclick="editRelease('${release.id}')">Edit</button>
                        <button class="btn btn-delete" onclick="deleteRelease('${release.id}')">Delete</button>
                    </div>
                </div>
                ${release.description ? `<div class="release-description">${release.description}</div>` : ''}
            </div>
        `).join('');
    }

    async function deleteRelease(releaseId) {
        if (!confirm('Are you sure you want to delete this release?')) return;

        try {
            const { error } = await supabase
                .from('releases')
                .delete()
                .eq('id', releaseId);

            if (error) throw error;

            showMessage('Release deleted successfully', 'success');
            loadReleases();
        } catch (error) {
            console.error('Error deleting release:', error);
            showMessage('Failed to delete release', 'error');
        }
    }

    // Check existing session on page load
    async function checkAuthState() {
        try {
            const { data: { session }, error } = await supabase.auth.getSession();
            
            if (error) throw error;
            
            if (session) {
                showDashboard();
                loadReleases();
            } else {
                showLogin();
            }
        } catch (error) {
            console.error('Auth state check error:', error);
            showLogin();
        }
    }

    // Real-time auth state listener
    supabase.auth.onAuthStateChange((event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN') {
            showDashboard();
            loadReleases();
        } else if (event === 'SIGNED_OUT') {
            showLogin();
        }
    });

    // Make functions global for onclick handlers
    window.deleteRelease = deleteRelease;
    window.editRelease = function(releaseId) {
        // You can implement edit functionality later
        alert('Edit functionality coming soon for release: ' + releaseId);
    };

    // Initialize the app
    checkAuthState();
});