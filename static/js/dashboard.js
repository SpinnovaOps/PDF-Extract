document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const username = document.getElementById('username');
    const documentCount = document.getElementById('document-count');
    const sectionCount = document.getElementById('section-count');
    const analysisCount = document.getElementById('analysis-count');
    const activityList = document.getElementById('activity-list');
    const logoutBtn = document.getElementById('logout-btn');
    
    // Navigation elements
    const uploadNav = document.getElementById('upload-nav');
    const documentsNav = document.getElementById('documents-nav');
    const settingsNav = document.getElementById('settings-nav');
    
    // Section elements
    const dashboardOverview = document.getElementById('dashboard-overview');
    const uploadSection = document.getElementById('upload-section');
    const documentsSection = document.getElementById('documents-section');
    const documentViewSection = document.getElementById('document-view-section');
    const settingsSection = document.getElementById('settings-section');
    
    // Upload elements
    const fileInput = document.getElementById('file-input');
    const fileName = document.getElementById('file-name');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadForm = document.getElementById('upload-form');
    const uploadStatus = document.getElementById('upload-status');
    const documentInfo = document.getElementById('document-info');
    const viewDocumentBtn = document.getElementById('view-document-btn');
    const uploadAnotherBtn = document.getElementById('upload-another-btn');
    
    // Document view elements
    const backToDocumentsBtn = document.getElementById('back-to-documents');
    const documentsList = document.getElementById('documents-list');
    const documentDetails = document.getElementById('document-details');
    const sectionsList = document.getElementById('sections-list');
    const sectionContent = document.getElementById('section-content');
    const sectionTitle = document.getElementById('section-title');
    const contentDisplay = document.getElementById('content-display');
    const processSectionBtn = document.getElementById('process-section-btn');
    
    // Settings elements
    const settingsForm = document.getElementById('settings-form');
    const settingsUsername = document.getElementById('settings-username');
    const settingsEmail = document.getElementById('settings-email');
    
    // Check if user is logged in
    checkLoginStatus();
    
    // Load dashboard data
    loadDashboardData();
    
    // Event listeners for navigation
    uploadNav.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(uploadSection);
    });
    
    documentsNav.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(documentsSection);
        loadDocuments();
    });
    
    settingsNav.addEventListener('click', function(e) {
        e.preventDefault();
        showSection(settingsSection);
        loadUserSettings();
    });
    
    // Event listener for logout
    logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // File upload event listeners
    fileInput.addEventListener('change', function() {
        if (fileInput.files.length > 0) {
            fileName.textContent = fileInput.files[0].name;
            uploadBtn.disabled = false;
        } else {
            fileName.textContent = '';
            uploadBtn.disabled = true;
        }
    });
    
    // Drag and drop functionality
    const uploadArea = document.querySelector('.upload-area');
    
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function() {
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length > 0) {
            fileInput.files = e.dataTransfer.files;
            fileName.textContent = fileInput.files[0].name;
            uploadBtn.disabled = false;
        }
    });
    
    // Handle file upload
    uploadForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (!fileInput.files.length) {
            showAlert('Please select a file to upload', 'error');
            return;
        }
        
        const formData = new FormData();
        formData.append('file', fileInput.files[0]);
        
        // Show loading state
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Uploading...';
        
        fetch('/file/upload', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
                uploadBtn.disabled = false;
                uploadBtn.textContent = 'Upload Document';
            } else {
                // Show success state
                uploadForm.classList.add('hidden');
                uploadStatus.classList.remove('hidden');
                
                // Get document details
                fetch('/extract/custom', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        code_name: data.code
                    })
                })
                .then(response => response.json())
                .then(sectionData => {
                    // Display document info
                    documentInfo.innerHTML = `
                        <p><strong>Document Code:</strong> ${data.code}</p>
                        <p><strong>Sections Found:</strong> ${sectionData.length}</p>
                    `;
                    
                    // Store document code for view button
                    viewDocumentBtn.setAttribute('data-code', data.code);
                })
                .catch(error => {
                    console.error('Error fetching sections:', error);
                });
            }
        })
        .catch(error => {
            showAlert('An error occurred during upload', 'error');
            console.error('Error:', error);
            uploadBtn.disabled = false;
            uploadBtn.textContent = 'Upload Document';
        });
    });
    
    // View document button
    viewDocumentBtn.addEventListener('click', function() {
        const code = viewDocumentBtn.getAttribute('data-code');
        if (code) {
            showSection(documentViewSection);
            loadDocumentDetails(code);
        }
    });
    
    // Upload another button
    uploadAnotherBtn.addEventListener('click', function() {
        uploadStatus.classList.add('hidden');
        uploadForm.classList.remove('hidden');
        fileInput.value = '';
        fileName.textContent = '';
        uploadBtn.disabled = true;
        uploadBtn.textContent = 'Upload Document';
    });
    
    // Back to documents button
    backToDocumentsBtn.addEventListener('click', function() {
        showSection(documentsSection);
        loadDocuments();
    });
    
    // Process section button
    processSectionBtn.addEventListener('click', function() {
        const code = processSectionBtn.getAttribute('data-code');
        const section = processSectionBtn.getAttribute('data-section');
        
        if (code && section) {
            window.location.href = `/processing-dashboard?code=${encodeURIComponent(code)}&section=${encodeURIComponent(section)}`;
        }
    });
    
    // Settings form submission
    settingsForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const email = settingsEmail.value;
        const password = document.getElementById('settings-password').value;
        
        // Validate inputs
        if (!email) {
            showAlert('Email is required', 'error');
            return;
        }
        
        // Send update request
        fetch('/user/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password || null
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
            } else {
                showAlert('Settings updated successfully', 'success');
                document.getElementById('settings-password').value = '';
            }
        })
        .catch(error => {
            showAlert('An error occurred', 'error');
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
            if (!data.loggedIn) {
                window.location.href = '/';
            } else {
                username.textContent = data.username;
            }
        })
        .catch(error => {
            console.error('Error checking login status:', error);
            window.location.href = '/';
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
                window.location.href = '/';
            }, 1000);
        })
        .catch(error => {
            showAlert('An error occurred during logout', 'error');
            console.error('Error:', error);
        });
    }
    
    // Function to load dashboard data
    function loadDashboardData() {
        // Fetch document count
        fetch('/file/list')
            .then(response => response.json())
            .then(data => {
                documentCount.textContent = data.length;
                
                // If there are documents, show recent activity
                if (data.length > 0) {
                    activityList.innerHTML = '';
                    
                    // Show up to 5 most recent documents
                    const recentDocs = data.slice(0, 5);
                    
                    recentDocs.forEach(doc => {
                        const activityItem = document.createElement('div');
                        activityItem.className = 'activity-item';
                        activityItem.innerHTML = `
                            <div class="activity-icon">📄</div>
                            <div class="activity-details">
                                <h4>Document uploaded: ${doc.filename}</h4>
                                <p class="activity-time">Code: ${doc.code}</p>
                            </div>
                        `;
                        activityList.appendChild(activityItem);
                    });
                }
            })
            .catch(error => {
                console.error('Error loading documents:', error);
            });
    }
    
    // Function to load documents
    function loadDocuments() {
        fetch('/file/list')
            .then(response => response.json())
            .then(data => {
                if (data.length === 0) {
                    documentsList.innerHTML = '<p class="no-documents">No documents found</p>';
                } else {
                    documentsList.innerHTML = '';
                    
                    data.forEach(doc => {
                        const docCard = document.createElement('div');
                        docCard.className = 'document-card';
                        docCard.innerHTML = `
                            <h3>${doc.filename}</h3>
                            <div class="document-meta">
                                <p><strong>Code:</strong> ${doc.code}</p>
                            </div>
                            <div class="document-actions">
                                <button class="btn btn-primary view-document" data-code="${doc.code}">View</button>
                            </div>
                        `;
                        documentsList.appendChild(docCard);
                    });
                    
                    // Add event listeners to view buttons
                    document.querySelectorAll('.view-document').forEach(btn => {
                        btn.addEventListener('click', function() {
                            const code = this.getAttribute('data-code');
                            showSection(documentViewSection);
                            loadDocumentDetails(code);
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Error loading documents:', error);
                documentsList.innerHTML = '<p class="no-documents">Error loading documents</p>';
            });
    }
    
    // Function to load document details
    function loadDocumentDetails(code) {
        // Fetch document details
        fetch('/extract/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code_name: code
            })
        })
        .then(response => response.json())
        .then(data => {
            // Display document details
            documentDetails.innerHTML = `
                <h3>Document Information</h3>
                <p><strong>Code:</strong> ${code}</p>
                <p><strong>Sections:</strong> ${data.length}</p>
            `;
            
            // Display sections
            sectionsList.innerHTML = '';
            
            data.forEach(section => {
                const sectionItem = document.createElement('div');
                sectionItem.className = 'section-item';
                sectionItem.textContent = section.section_name;
                sectionItem.setAttribute('data-section', section.section_name);
                sectionItem.setAttribute('data-code', code);
                sectionsList.appendChild(sectionItem);
            });
            
            // Add event listeners to section items
            document.querySelectorAll('.section-item').forEach(item => {
                item.addEventListener('click', function() {
                    // Remove active class from all sections
                    document.querySelectorAll('.section-item').forEach(s => {
                        s.classList.remove('active');
                    });
                    
                    // Add active class to clicked section
                    this.classList.add('active');
                    
                    const sectionName = this.getAttribute('data-section');
                    const code = this.getAttribute('data-code');
                    
                    // Fetch section content
                    fetch('/extract/section', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            code_name: code,
                            section_name: sectionName
                        })
                    })
                    .then(response => response.json())
                    .then(data => {
                        // Display section content
                        sectionContent.classList.remove('hidden');
                        sectionTitle.textContent = sectionName;
                        contentDisplay.textContent = data.content;
                        
                        // Set data attributes for process button
                        processSectionBtn.setAttribute('data-code', code);
                        processSectionBtn.setAttribute('data-section', sectionName);
                    })
                    .catch(error => {
                        console.error('Error loading section content:', error);
                        contentDisplay.textContent = 'Error loading section content';
                    });
                });
            });
        })
        .catch(error => {
            console.error('Error loading document details:', error);
            documentDetails.innerHTML = '<p>Error loading document details</p>';
        });
    }
    
    // Function to load user settings
    function loadUserSettings() {
        fetch('/user/info', {
            method: 'GET',
            credentials: 'include'
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert(data.error, 'error');
            } else {
                settingsUsername.value = data.username;
                settingsEmail.value = data.email;
            }
        })
        .catch(error => {
            showAlert('Error loading user settings', 'error');
            console.error('Error:', error);
        });
    }
    
    // Function to show a specific section
    function showSection(section) {
        // Hide all sections
        dashboardOverview.classList.add('hidden');
        uploadSection.classList.add('hidden');
        documentsSection.classList.add('hidden');
        documentViewSection.classList.add('hidden');
        settingsSection.classList.add('hidden');
        
        // Show the requested section
        section.classList.remove('hidden');
        
        // Update active nav item
        document.querySelectorAll('.sidebar-nav li').forEach(item => {
            item.classList.remove('active');
        });
        
        if (section === dashboardOverview) {
            document.querySelector('.sidebar-nav li:first-child').classList.add('active');
        } else if (section === uploadSection) {
            document.querySelector('.sidebar-nav li:nth-child(2)').classList.add('active');
        } else if (section === documentsSection) {
            document.querySelector('.sidebar-nav li:nth-child(3)').classList.add('active');
        } else if (section === settingsSection) {
            document.querySelector('.sidebar-nav li:nth-child(5)').classList.add('active');
        }
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
        
        .upload-area.dragover {
            border-color: var(--secondary-color);
            background-color: rgba(52, 152, 219, 0.05);
        }
    `;
    document.head.appendChild(style);
});