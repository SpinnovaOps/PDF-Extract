# FinDoc Analyzer

A comprehensive financial document analysis platform that extracts, processes, and analyzes SEC filings using advanced NLP techniques.

## Project Overview

FinDoc Analyzer is a web application designed to help financial analysts, investors, and researchers extract valuable insights from SEC filings (10-Q and 10-K documents). The platform leverages natural language processing (NLP) techniques to analyze financial statements and provide meaningful insights.

## Features

- **Document Upload**: Upload 10-Q and 10-K SEC filings with automatic metadata extraction
- **Section Extraction**: Automatically identify and extract key sections from financial documents
- **NLP Processing**: Apply advanced NLP techniques including:
  - Sentence segmentation
  - Tokenization
  - Stopwords removal
  - Lemmatization
  - Stemming
  - Part-of-speech (POS) tagging
  - Named Entity Recognition (NER)
  - Sentiment analysis
- **User Authentication**: Secure login and registration system
- **Document Management**: Organize and access your uploaded documents
- **Processing Dashboard**: Dedicated interface for text processing operations

## Technology Stack

- **Backend**: Flask (Python)
- **Database**: MongoDB
- **NLP**: NLTK (Natural Language Toolkit)
- **PDF Processing**: pdfplumber
- **Frontend**: HTML, CSS, JavaScript

## Setup Instructions

### Prerequisites

- Python 3.8+
- MongoDB Atlas account
- pip (Python package manager)

### Environment Setup

1. Clone the repository:
   ```
   git clone <repository-url>
   cd findoc-analyzer
   ```

2. Create a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the project root with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   SECRET_KEY=your_secret_key
   ```

### Database Setup

1. Create a MongoDB Atlas cluster
2. Create a database named `pdf_data`
3. Create the following collections:
   - `users`
   - `documents`
   - `sections`

### Running the Application

1. Start the Flask application:
   ```
   python app.py
   ```

2. Access the application at `http://localhost:5000`

## Project Structure

```
findoc-analyzer/
├── app/
│   ├── controllers/       # Request handlers
│   ├── models/            # Database models
│   ├── processing/        # NLP processing logic
│   ├── services/          # Business logic
│   ├── utils/             # Utility functions
│   ├── __init__.py
│   ├── config.py          # Application configuration
│   └── routes.py          # URL routes
├── static/
│   ├── css/               # Stylesheets
│   ├── js/                # JavaScript files
│   └── img/               # Images
├── templates/             # HTML templates
├── uploads/               # Uploaded documents
├── outputs/               # Processing outputs
├── app.py                 # Application entry point
├── requirements.txt       # Dependencies
└── README.md              # Project documentation
```

## Step-by-Step Usage Guide

### 1. User Registration and Login

1. Navigate to the homepage
2. Click "Sign Up" to create a new account
3. Fill in your username, email, and password
4. Click "Sign Up" to create your account
5. Log in with your credentials

### 2. Uploading a Document

1. From the dashboard, click "Upload Documents" in the sidebar
2. Drag and drop a 10-Q or 10-K PDF file or click "Browse Files"
3. Click "Upload Document"
4. The system will automatically extract metadata from the document
5. Once uploaded, you can view the document details

### 3. Viewing Document Sections

1. From the dashboard, click "My Documents" in the sidebar
2. Find your document in the list and click "View"
3. The system will display document information and available sections
4. Click on a section name to view its content

### 4. Processing Text

1. From the document view, click "Process This Section" on any section
2. You'll be redirected to the Text Processing Dashboard
3. The document and section will be pre-selected
4. Choose a processing option:
   - Click "Run Complete Analysis" for a comprehensive report
   - Or select individual processing steps (Segmentation, Tokenization, etc.)
5. View the results and download the output files

### 5. Analyzing Results

1. Review the processing results displayed on the screen
2. For sentiment analysis, check the overall sentiment (Positive, Negative, or Neutral)
3. Click "View Full Results" to see the complete output
4. Use these insights for your financial analysis

## NLP Processing Details

### Segmentation
Splits the text into individual sentences using NLTK's sentence tokenizer.

### Tokenization
Breaks sentences into individual words or tokens.

### Stopwords Removal
Removes common words (like "the", "is", "at") that don't add significant meaning.

### Lemmatization
Reduces words to their base or dictionary form (e.g., "running" → "run").

### Stemming
Reduces words to their root form by removing affixes (e.g., "running" → "run").

### POS Tagging
Tags words with their parts of speech (noun, verb, adjective, etc.).

### Named Entity Recognition
Identifies named entities such as people, organizations, and locations.

### Sentiment Analysis
Analyzes the sentiment/tone of the text and provides polarity scores:
- Compound: Overall sentiment (-1 to +1)
- Positive: Degree of positive sentiment (0 to 1)
- Neutral: Degree of neutral sentiment (0 to 1)
- Negative: Degree of negative sentiment (0 to 1)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.