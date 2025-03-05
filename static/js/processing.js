document.addEventListener('DOMContentLoaded', function() {
    // Get DOM elements
    const documentSelect = document.getElementById('document-select');
    const sectionSelect = document.getElementById('section-select');
    const processAllBtn = document.getElementById('process-all-btn');
    const processingSteps = document.querySelectorAll('.step-card button');
    const resultsSection = document.getElementById('results-section');
    const loadingIndicator = document.getElementById('loading');
    const alertContainer = document.getElementById('alert-container');
    const backToDashboardBtn = document.getElementById('back-to-dashboard');
    
    // Check URL parameters for pre-selected document and section
    const urlParams = new URLSearchParams(window.location.search);
    const preSelectedCode = urlParams.get('code');
    const preSelectedSection = urlParams.get('section');
    
    // Fetch documents when page loads
    fetchDocuments();
    
    // Event listeners
    documentSelect.addEventListener('change', fetchSections);
    processAllBtn.addEventListener('click', processAllSteps);
    
    // Back to dashboard button
    if (backToDashboardBtn) {
        backToDashboardBtn.addEventListener('click', function() {
            window.location.href = '/dashboard';
        });
    }
    
    // Add event listeners to individual processing step buttons
    processingSteps.forEach(button => {
        button.addEventListener('click', function() {
            const processingType = this.getAttribute('data-process');
            processText(processingType);
        });
    });
    
    // Function to fetch all uploaded documents
    function fetchDocuments() {
        showLoading(true);
        
        fetch('/file/list')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch documents');
                }
                return response.json();
            })
            .then(data => {
                documentSelect.innerHTML = '<option value="">Select a document</option>';
                
                data.forEach(doc => {
                    const option = document.createElement('option');
                    option.value = doc.code;
                    option.textContent = `${doc.filename || doc.code} (${doc.code})`;
                    documentSelect.appendChild(option);
                    
                    // If this is the pre-selected document, select it
                    if (preSelectedCode && doc.code === preSelectedCode) {
                        option.selected = true;
                    }
                });
                
                showLoading(false);
                
                // If we have a pre-selected document, fetch its sections
                if (preSelectedCode && documentSelect.value) {
                    fetchSections();
                }
            })
            .catch(error => {
                showAlert('error', error.message);
                showLoading(false);
            });
    }
    
    // Function to fetch sections for selected document
    function fetchSections() {
        const codeValue = documentSelect.value;
        
        if (!codeValue) {
            sectionSelect.innerHTML = '<option value="">Select a document first</option>';
            return;
        }
        
        showLoading(true);
        
        fetch('/extract/custom', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code_name: codeValue
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch sections');
            }
            return response.json();
        })
        .then(data => {
            sectionSelect.innerHTML = '<option value="">Select a section</option>';
            
            data.forEach(section => {
                const option = document.createElement('option');
                option.value = section.section_name;
                option.textContent = section.section_name;
                sectionSelect.appendChild(option);
                
                // If this is the pre-selected section, select it
                if (preSelectedSection && section.section_name === preSelectedSection) {
                    option.selected = true;
                }
            });
            
            showLoading(false);
        })
        .catch(error => {
            showAlert('error', error.message);
            showLoading(false);
        });
    }
    
    // Function to process text with specified processing type
    function processText(processingType) {
        const codeValue = documentSelect.value;
        const sectionValue = sectionSelect.value;
        
        if (!codeValue || !sectionValue) {
            showAlert('error', 'Please select both a document and a section');
            return;
        }
        
        showLoading(true);
        
        fetch(`/processing/${processingType}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code_name: codeValue,
                section_name: sectionValue
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to process ${processingType}`);
            }
            return response.json();
        })
        .then(data => {
            showLoading(false);
            displayResults(data, processingType);
            showAlert('success', `${capitalizeFirstLetter(processingType)} completed successfully`);
        })
        .catch(error => {
            showLoading(false);
            showAlert('error', error.message);
        });
    }
    
    // Function to process all steps at once
    function processAllSteps() {
        const codeValue = documentSelect.value;
        const sectionValue = sectionSelect.value;
        
        if (!codeValue || !sectionValue) {
            showAlert('error', 'Please select both a document and a section');
            return;
        }
        
        showLoading(true);
        
        fetch('/processing/process_all', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                code_name: codeValue,
                section_name: sectionValue
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to process all steps');
            }
            return response.json();
        })
        .then(data => {
            showLoading(false);
            
            // Display comprehensive results
            resultsSection.classList.remove('hidden');
            resultsSection.innerHTML = `
                <h2>Complete Analysis Results</h2>
                <div class="result-item">
                    <h3>Comprehensive Analysis</h3>
                    <p>A complete analysis has been performed and saved to: ${data.filepath}</p>
                    
                    <div class="sentiment-score">
                        <span class="score-label">Overall Sentiment:</span>
                        <span class="score-value ${getSentimentClass(data.sentiment_summary.overall)}">${data.sentiment_summary.overall}</span>
                    </div>
                    
                    <div class="sentiment-score">
                        <span class="score-label">Compound Score:</span>
                        <span class="score-value ${getSentimentClass(data.sentiment_summary.compound)}">${data.sentiment_summary.compound.toFixed(2)}</span>
                    </div>
                </div>
                
                <div class="form-group">
                    <a href="/outputs/${data.filepath.split('/').pop()}" class="btn btn-info" target="_blank">View Full Report</a>
                </div>
            `;
            
            showAlert('success', 'Complete analysis finished successfully');
        })
        .catch(error => {
            showLoading(false);
            showAlert('error', error.message);
        });
    }
    
    // Function to display processing results
    function displayResults(data, processingType) {
        resultsSection.classList.remove('hidden');
        
        let resultContent = '';
        
        if (processingType === 'sentiment_analysis') {
            const scores = data.polarity_scores;
            const compound = scores.compound;
            const sentiment = compound >= 0.05 ? 'Positive' : (compound <= -0.05 ? 'Negative' : 'Neutral');
            
            resultContent = `
                <div class="result-item">
                    <h3>Sentiment Analysis Results</h3>
                    <div class="sentiment-score">
                        <span class="score-label">Overall Sentiment:</span>
                        <span class="score-value ${getSentimentClass(sentiment)}">${sentiment}</span>
                    </div>
                    <div class="sentiment-score">
                        <span class="score-label">Compound Score:</span>
                        <span class="score-value ${getSentimentClass(compound)}">${compound.toFixed(2)}</span>
                    </div>
                    <div class="sentiment-score">
                        <span class="score-label">Positive:</span>
                        <span>${scores.pos.toFixed(2)}</span>
                    </div>
                    <div class="sentiment-score">
                        <span class="score-label">Neutral:</span>
                        <span>${scores.neu.toFixed(2)}</span>
                    </div>
                    <div class="sentiment-score">
                        <span class="score-label">Negative:</span>
                        <span>${scores.neg.toFixed(2)}</span>
                    </div>
                </div>
            `;
        } else {
            // For other processing types, show a sample of the results
            let sampleData = '';
            
            if (processingType === 'segmentation' && data.sentences) {
                sampleData = data.sentences.slice(0, 3).join('\n');
            } else if (processingType === 'tokenization' && data.tokens) {
                sampleData = data.tokens.slice(0, 3).map(tokens => tokens.join(' ')).join('\n');
            } else if (data.filepath) {
                sampleData = `Results saved to: ${data.filepath}`;
            }
            
            resultContent = `
                <div class="result-item">
                    <h3>${capitalizeFirstLetter(processingType)} Results</h3>
                    <div class="result-content">${sampleData}</div>
                </div>
            `;
        }
        
        resultsSection.innerHTML = `
            <h2>Processing Results</h2>
            ${resultContent}
            <div class="form-group">
                <a href="/outputs/${data.filepath.split('/').pop()}" class="btn btn-info" target="_blank">View Full Results</a>
            </div>
        `;
    }
    
    // Helper function to show/hide loading indicator
    function showLoading(show) {
        loadingIndicator.style.display = show ? 'block' : 'none';
    }
    
    // Helper function to show alerts
    function showAlert(type, message) {
        const alertClass = type === 'error' ? 'alert-danger' : 'alert-success';
        
        alertContainer.innerHTML = `
            <div class="alert ${alertClass}">
                ${message}
            </div>
        `;
        
        // Auto-hide alert after 5 seconds
        setTimeout(() => {
            alertContainer.innerHTML = '';
        }, 5000);
    }
    
    // Helper function to capitalize first letter
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.replace(/_/g, ' ').slice(1);
    }
    
    // Helper function to get sentiment class
    function getSentimentClass(sentiment) {
        if (typeof sentiment === 'string') {
            return sentiment === 'Positive' ? 'score-positive' : 
                   sentiment === 'Negative' ? 'score-negative' : 'score-neutral';
        } else {
            return sentiment >= 0.05 ? 'score-positive' : 
                   sentiment <= -0.05 ? 'score-negative' : 'score-neutral';
        }
    }
});