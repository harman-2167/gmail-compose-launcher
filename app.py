"""
app.py
------
Production-ready Flask application that serves a premium, single-page
website whose sole purpose is to open Gmail's compose window with
pre-filled recipient, subject and body.

The application NEVER handles credentials, NEVER sends email on the
server side, and NEVER stores any user data. All the "compose" logic
happens entirely in the browser via a Gmail deep-link
(https://mail.google.com/mail/?view=cm&...), which the user must
review and send manually.

Author: Expert Flask Developer
"""

from __future__ import annotations

import logging
import os

from flask import Flask, render_template, jsonify
from werkzeug.exceptions import HTTPException


def create_app() -> Flask:
    """
    Application factory.

    Using the factory pattern keeps the app modular and makes it easy
    to extend with blueprints, config profiles (dev/prod/test) or
    testing fixtures in the future, following Flask best practices.
    """
    app = Flask(__name__, static_folder="static", template_folder="templates")

    # ------------------------------------------------------------------
    # Basic configuration
    # ------------------------------------------------------------------
    app.config.update(
        SECRET_KEY=os.environ.get("SECRET_KEY", "dev-secret-key-change-in-production"),
        JSON_SORT_KEYS=False,
        TEMPLATES_AUTO_RELOAD=True,
    )

    # ------------------------------------------------------------------
    # Logging
    # ------------------------------------------------------------------
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s | %(levelname)s | %(message)s",
    )
    app.logger.setLevel(logging.INFO)

    # ------------------------------------------------------------------
    # Routes
    # ------------------------------------------------------------------
    @app.route("/", methods=["GET"])
    def index():
        """Render the landing / compose page."""
        return render_template("index.html")

    @app.route("/healthz", methods=["GET"])
    def health_check():
        """Simple health check endpoint for uptime monitors / deployment platforms."""
        return jsonify(status="ok", service="gmail-compose-launcher"), 200

    # ------------------------------------------------------------------
    # Error handlers
    # ------------------------------------------------------------------
    @app.errorhandler(404)
    def not_found(_error):
        return render_template("index.html"), 404

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        app.logger.warning("HTTP exception: %s", error)
        return jsonify(error=error.name, description=error.description), error.code

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Unhandled exception: %s", error)
        return jsonify(error="Internal Server Error",
                        description="Something went wrong on our end."), 500

    return app


# Module-level app instance so that WSGI servers (gunicorn, waitress, etc.)
# can simply reference `app:app`.
app = create_app()


if __name__ == "__main__":
    # Debug mode should ALWAYS be disabled in production.
    debug_mode = os.environ.get("FLASK_DEBUG", "0") == "1"
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=debug_mode)
