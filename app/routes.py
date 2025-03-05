from flask import Flask, render_template, jsonify, session, request, redirect, url_for
from app.controllers import auth_controller, file_controller, extraction_controller

def init_app(app):
    # Authentication endpoints
    app.route("/auth/signin", methods=["POST"])(auth_controller.signup)
    app.route("/auth/login", methods=["POST"])(auth_controller.login)
    app.route("/auth/logout", methods=["POST"])(auth_controller.logout)
    
    # Auth status endpoint
    @app.route("/auth/status", methods=["GET"])
    def auth_status():
        if "username" in session:
            return jsonify({"loggedIn": True, "username": session["username"]})
        return jsonify({"loggedIn": False})

    # File management endpoints
    app.route("/file/upload", methods=["POST"])(file_controller.upload_file)
    app.route("/file/list", methods=["GET"])(file_controller.list_uploaded_files)

    # Extraction endpoints
    app.route("/extract/custom", methods=["POST"])(extraction_controller.list_sections)
    app.route("/extract/section", methods=["POST"])(extraction_controller.extract_section_content)
    
    # UI Routes
    @app.route("/")
    def index():
        return render_template("index.html")
    
    @app.route("/dashboard")
    def dashboard():
        if "username" not in session:
            return redirect(url_for("index"))
        return render_template("dashboard.html")
    
    @app.route("/processing-dashboard")
    def processing_dashboard():
        if "username" not in session:
            return redirect(url_for("index"))
        return render_template("processing.html")
    
    # Serve static files from outputs directory
    @app.route("/outputs/<path:filename>")
    def serve_output_file(filename):
        from flask import send_from_directory
        import os
        outputs_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "outputs")
        return send_from_directory(outputs_dir, filename)
    
    # User settings endpoint (placeholder)
    @app.route("/user/info", methods=["GET"])
    def user_info():
        if "username" not in session:
            return jsonify({"error": "User not logged in"}), 401
        
        username = session["username"]
        # In a real application, you would fetch this from the database
        # For now, we'll return a placeholder
        return jsonify({
            "username": username,
            "email": f"{username}@example.com"
        })