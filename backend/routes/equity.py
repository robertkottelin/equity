from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.user import User
from models.asset import Asset
from extensions import db
import logging

# Set up security logging
logger = logging.getLogger('equity_security')
logger.setLevel(logging.INFO)

equity_bp = Blueprint('equity', __name__)

def verify_user_ownership(user_id, asset_id=None):
    """
    Security helper to verify user owns the asset they're trying to access.
    Returns (user, asset, error_response) tuple.
    """
    user = User.query.get(int(user_id))
    
    if not user:
        logger.warning(f"User not found: {user_id}")
        return None, None, (jsonify({"error": "User not found"}), 404)
    
    # If no asset_id, just return the user
    if asset_id is None:
        return user, None, None
        
    # Verify user owns the asset
    asset = Asset.query.filter_by(id=asset_id, user_id=user.id).first()
    
    if not asset:
        logger.warning(f"Unauthorized asset access attempt: User {user_id} tried to access asset {asset_id}")
        return user, None, (jsonify({"error": "Asset not found or not owned by user"}), 404)
        
    return user, asset, None

@equity_bp.route('/assets', methods=['GET'])
@jwt_required()
def get_assets():
    user_id = get_jwt_identity()
    user, _, error = verify_user_ownership(user_id)
    
    if error:
        return error
    
    # Query only assets belonging to the current user
    assets = Asset.query.filter_by(user_id=user.id).all()
    
    return jsonify({
        "assets": [asset.to_dict() for asset in assets]
    })

@equity_bp.route('/assets', methods=['POST'])
@jwt_required()
def add_asset():
    user_id = get_jwt_identity()
    user, _, error = verify_user_ownership(user_id)
    
    if error:
        return error
    
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['sectorType', 'name', 'price', 'acquisitionPrice', 'amount', 'value', 
                       'profitLoss', 'profitLossPercentage']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Helper function to convert empty strings to None
    def convert_empty_to_none(value):
        return None if value == '' else value
    
    # Create new asset with proper type handling
    asset = Asset(
        user_id=user.id,
        sector_type=data.get('sectorType'),
        sub_sector=convert_empty_to_none(data.get('subSector')),  # Handle new sub-sector field
        name=data.get('name'),
        price=data.get('price'),
        acquisition_price=data.get('acquisitionPrice'),
        amount=data.get('amount'),
        value=data.get('value'),
        profit_loss=data.get('profitLoss'),
        profit_loss_percentage=data.get('profitLossPercentage'),
        pe=convert_empty_to_none(data.get('pe')),
        dividend_yield=convert_empty_to_none(data.get('dividendYield')),
        growth_1y=convert_empty_to_none(data.get('growth1y')),
        growth_3y=convert_empty_to_none(data.get('growth3y')),
        growth_5y=convert_empty_to_none(data.get('growth5y'))
    )
    
    db.session.add(asset)
    db.session.commit()
    
    logger.info(f"User {user.id} created new asset {asset.id}")
    
    return jsonify({
        "success": True,
        "asset": asset.to_dict()
    }), 201

@equity_bp.route('/assets/<int:asset_id>', methods=['PUT'])
@jwt_required()
def update_asset(asset_id):
    user_id = get_jwt_identity()
    user, asset, error = verify_user_ownership(user_id, asset_id)
    
    if error:
        return error
    
    data = request.get_json()

    def convert_empty_to_none(value):
        if value == '':
            return None
        return value
    
    # Update asset fields
    asset.sector_type = data.get('sectorType', asset.sector_type)
    asset.sub_sector = convert_empty_to_none(data.get('subSector', asset.sub_sector))  # Handle sub-sector updates
    asset.name = data.get('name', asset.name)
    asset.price = data.get('price', asset.price)
    asset.acquisition_price = data.get('acquisitionPrice', asset.acquisition_price)
    asset.amount = data.get('amount', asset.amount)
    asset.value = data.get('value', asset.value)
    asset.profit_loss = data.get('profitLoss', asset.profit_loss)
    asset.profit_loss_percentage = data.get('profitLossPercentage', asset.profit_loss_percentage)
    asset.pe = convert_empty_to_none(data.get('pe', asset.pe))
    asset.dividend_yield = convert_empty_to_none(data.get('dividendYield', asset.dividend_yield))
    asset.growth_1y = convert_empty_to_none(data.get('growth1y', asset.growth_1y))
    asset.growth_3y = convert_empty_to_none(data.get('growth3y', asset.growth_3y))
    asset.growth_5y = convert_empty_to_none(data.get('growth5y', asset.growth_5y))
    
    db.session.commit()
    
    logger.info(f"User {user.id} updated asset {asset.id}")
    
    return jsonify({
        "success": True,
        "asset": asset.to_dict()
    })

@equity_bp.route('/assets/<int:asset_id>', methods=['DELETE'])
@jwt_required()
def delete_asset(asset_id):
    user_id = get_jwt_identity()
    user, asset, error = verify_user_ownership(user_id, asset_id)
    
    if error:
        return error
    
    db.session.delete(asset)
    db.session.commit()
    
    logger.info(f"User {user.id} deleted asset {asset.id}")
    
    return jsonify({
        "success": True,
        "message": "Asset deleted successfully"
    })

@equity_bp.route('/summary', methods=['GET'])
@jwt_required()
def get_summary():
    user_id = get_jwt_identity()
    user, _, error = verify_user_ownership(user_id)
    
    if error:
        return error
    
    assets = Asset.query.filter_by(user_id=user.id).all()
    
    # Calculate total value
    total_value = sum(asset.value for asset in assets)
    
    # Group assets by sector type
    sectors = {}
    for asset in assets:
        sector = asset.sector_type
        if sector not in sectors:
            sectors[sector] = {"count": 0, "value": 0}
        
        sectors[sector]["count"] += 1
        sectors[sector]["value"] += asset.value
    
    return jsonify({
        "totalValue": total_value,
        "sectorSummary": sectors
    })