from flask import Flask, jsonify, request
from flask_cors import CORS
import os
from dotenv import load_dotenv
from extensions import db
from flask_jwt_extended import JWTManager

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)

# Configure SQLAlchemy
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URI', 'sqlite:///equity.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# JWT Configuration
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-jwt-secret-key-change-in-production')
app.config['JWT_COOKIE_SECURE'] = False  # Use True in production
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 30 * 24 * 60 * 60  # 30 days
jwt = JWTManager(app)

# Initialize extensions
db.init_app(app)

# CORS Configuration
# CORS(app, supports_credentials=True)

# Allow requests from frontend development server
CORS(app, origins="*", supports_credentials=True, allow_headers=["Content-Type", "Authorization"])

# Import models and blueprints
from models.user import User, user_bp
from routes.equity import equity_bp

# Register blueprints
app.register_blueprint(user_bp, url_prefix='/api')
app.register_blueprint(equity_bp, url_prefix='/api/equity')

@app.route('/api/health')
def health_check():
    try:
        db.session.execute('SELECT 1')
        return jsonify({"status": "healthy"}), 200
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500

# Create database tables before first request
@app.before_first_request
def create_tables():
    db.create_all()

if __name__ == '__main__':
    # Create database tables if they don't exist
    with app.app_context():
        db.create_all()
    
    # Run the app
    app.run(host='0.0.0.0', port=5000, debug=True)