from flask import Blueprint, request, jsonify
import os
import stripe
from extensions import db
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

user_bp = Blueprint('user', __name__)

class User(db.Model):
    """User model for subscription management."""
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=True)
    customer_id = db.Column(db.String(120), nullable=True)
    subscription_id = db.Column(db.String(120), nullable=True)
    subscription_status = db.Column(db.String(50), default="inactive")
    
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)
        
    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
print(f"Stripe API key configured: {stripe.api_key[:4]}{'*' * 10}")


@user_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    print(f"Register request data: {data}")
    email = data.get('email')
    password = data.get('password')
    
    if not email or not password:
        return jsonify({"error": "Email and password required"}), 400
        
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({"error": "Email already registered"}), 409
    
    user = User(email=email, subscription_status="inactive")
    user.set_password(password)
    db.session.add(user)
    db.session.commit()
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "success": True, 
        "token": access_token,
        "user": {
            "email": user.email, 
            "isSubscribed": False
        }
    }), 201

@user_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    
    user = User.query.filter_by(email=email).first()
    if not user or not user.check_password(password):
        return jsonify({"error": "Invalid email or password"}), 401
    
    access_token = create_access_token(identity=str(user.id))
    
    return jsonify({
        "success": True,
        "token": access_token,
        "user": {
            "email": user.email, 
            "isSubscribed": user.subscription_status == "active"
        }
    })

@user_bp.route('/logout', methods=['POST'])
def logout():
    return jsonify({"success": True})

@user_bp.route('/me', methods=['GET'])
@jwt_required()
def get_current_user():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({
        "email": user.email,
        "isSubscribed": user.subscription_status == "active"
    })

@user_bp.route('/subscribe', methods=['POST'])
@jwt_required()
def subscribe_user():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        data = request.get_json()
        payment_method_id = data.get("paymentMethodId")
        
        if not payment_method_id:
            return jsonify({"error": "Payment method ID is required"}), 400
            
        price_id = os.getenv("STRIPE_PRICE_ID")
        if not price_id:
            return jsonify({"error": "Stripe price ID not configured"}), 500
            
        # Validate price exists
        try:
            stripe.Price.retrieve(price_id)
        except stripe.error.InvalidRequestError:
            return jsonify({"error": "Invalid Stripe price configuration"}), 500

        
        # Create or retrieve Stripe customer
        if user.customer_id:
            customer = stripe.Customer.retrieve(user.customer_id)
        else:
            customer = stripe.Customer.create(email=user.email)
            user.customer_id = customer.id

        # Attach payment method
        stripe.PaymentMethod.attach(payment_method_id, customer=customer.id)
        
        # Set as default payment method
        stripe.Customer.modify(
            customer.id,
            invoice_settings={"default_payment_method": payment_method_id}
        )

        # Create subscription
        subscription = stripe.Subscription.create(
            customer=customer.id,
            items=[{"price": price_id}],
            expand=["latest_invoice.payment_intent"],
        )

        # Update user subscription details
        user.subscription_id = subscription.id
        user.subscription_status = subscription.status
        db.session.commit()
        
        return jsonify({
            "success": True,
            "subscriptionId": subscription.id,
            "status": subscription.status
        })
            
    except stripe.error.CardError as e:
        return jsonify({
            "error": "Payment method declined",
            "message": str(e)
        }), 400
    except Exception as e:
        import traceback
        print(f"SUBSCRIPTION ERROR: {str(e)}")
        print(traceback.format_exc())
        return jsonify({"error": str(e)}), 500

@user_bp.route('/check-subscription', methods=['GET'])
@jwt_required()
def check_subscription():
    user_id = get_jwt_identity()
    user = User.query.get(int(user_id))
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify({"isSubscribed": user.subscription_status == "active"}), 200

@user_bp.route('/cancel-subscription', methods=['POST'])
@jwt_required()
def cancel_subscription():
    try:
        user_id = get_jwt_identity()
        user = User.query.get(int(user_id))
        
        if not user:
            return jsonify({"error": "User not found"}), 404
            
        if not user.subscription_id:
            return jsonify({"error": "No active subscription found"}), 400

        # Cancel the subscription in Stripe
        stripe.Subscription.delete(user.subscription_id)

        # Update the user's subscription status
        user.subscription_status = "canceled"
        db.session.commit()

        return jsonify({"success": True, "message": "Subscription canceled successfully"}), 200
    except Exception as e:
        print(f"Cancellation error: {str(e)}")
        return jsonify({"error": str(e)}), 500