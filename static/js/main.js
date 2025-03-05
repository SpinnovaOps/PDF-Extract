document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const loginBtn = document.getElementById('login-btn');
    const signupBtn = document.getElementById('signup-btn');
    const getStartedBtn = document.getElementById('get-started-btn');
    const loginModal = document.getElementById('login-modal');
    const signupModal = document.getElementById('signup-modal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const switchToSignup = document.getElementById('switch-to-signup');
    const switchToLogin = document.getElementById('switch-to-login');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');
    
    // Check if user is already logged in
    checkLoginStatus();
    
    // Event listeners for opening modals
    loginBtn.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'flex';
    });
    
    signupBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.style.display = 'flex';
    });
    
    getStartedBtn.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.style.display = 'flex';
    });
    
    // Event listeners for closing modals
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            loginModal.style.display = 'none';
            signupModal.style.display = 'none';
        });
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === loginModal) {
            loginModal.style.display = 'none';
        }
        if (e.target === signupModal) {
            signupModal.style.display = 'none';
        }
    });
    
    // Switch between login and signup modals
    switchToSignup.addEventListener('click', function(e) {
        e.preventDefault();
        loginModal.style.display = 'none';
        signupModal.style.display = 'flex';
    });
    
    switchToLogin.addEventListener('click', function(e) {
        e.preventDefault();
        signupModal.style.display = 'none';
        loginModal.style.display = 'flex';
    });
    
    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        // Validate inputs
        if (!username || !password) {
            showAlert('Please fill in all fields', 'error ```
            )
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        // Send login request
        fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
            } else {
                showAlert('Login successful! Redirecting...', 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            }
        })
        .catch(error => {
            showAlert('An error occurred. Please try again.', 'error');
            console.error('Error:', error);
        });
    });
    
    // Handle signup form submission
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('signup-username').value;
        const email = document.getElementById('signup-email').value;
        const password = document.getElementById('signup-password').value;
        
        // Validate inputs
        if (!username || !email || !password) {
            showAlert('Please fill in all fields', 'error');
            return;
        }
        
        if (username.length < 3) {
            showAlert('Username must be at least 3 characters', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAlert('Password must be at least 6 characters', 'error');
            return;
        }
        
        // Send signup request
        fetch('/auth/signin', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                emailid: email,
                password: password
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
            } else {
                showAlert('Account created successfully! Please log in.', 'success');
                setTimeout(() => {
                    signupModal.style.display = 'none';
                    loginModal.style.display = 'flex';
                }, 1500);
            }
        })
        .catch(error => {
            showAlert('An error occurred. Please try again.', 'error');
            console.error('Error:', error);
        });
    });
    
    // Function to check login status
    function checkLoginStatus() {
        fetch('/auth/status', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.loggedIn) {
                // Update UI for logged in user
                loginBtn.textContent = 'Dashboard';
                loginBtn.href = '/dashboard';
                signupBtn.textContent = 'Logout';
                signupBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    logout();
                });
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
        });
    }
    
    // Function to handle logout
    function logout() {
        fetch('/auth/logout', {
            method: 'POST',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            showAlert('Logged out successfully', 'success');
            setTimeout(() => {
                window.location.reload();
            }, 1000);
        })
        .catch(error => {
            showAlert('An error occurred during logout', 'error');
            console.error('Error:', error);
        });
    }
    
    // Function to show alerts
    function showAlert(message, type) {
        const alertContainer = document.createElement('div');
        alertContainer.className = `alert alert-${type}`;
        alertContainer.textContent = message;
        
        document.body.appendChild(alertContainer);
        
        setTimeout(() => {
            alertContainer.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            alertContainer.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(alertContainer);
            }, 300);
        }, 3000);
    }
    
    // Add styles for alerts
    const style = document.createElement('style');
    style.textContent = `
        .alert {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 9999;
            opacity: 0;
            transform: translateY(-20px);
            transition: opacity 0.3s, transform 0.3s;
            max-width: 300px;
        }
        
        .alert.show {
            opacity: 1;
            transform: translateY(0);
        }
        
        .alert-success {
            background-color: #2ecc71;
        }
        
        .alert-error {
            background-color: #e74c3c;
        }
    `;
    document.head.appendChild(style);
});
```