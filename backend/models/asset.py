from extensions import db
from datetime import datetime

class Asset(db.Model):
    """Asset model for equity management."""
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sector_type = db.Column(db.String(50), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.Float, nullable=False)
    acquisition_price = db.Column(db.Float, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    value = db.Column(db.Float, nullable=False)
    profit_loss = db.Column(db.Float, nullable=False)
    profit_loss_percentage = db.Column(db.Float, nullable=False)
    pe = db.Column(db.Float, nullable=True)
    dividend_yield = db.Column(db.Float, nullable=True)
    growth_1y = db.Column(db.Float, nullable=True)
    growth_3y = db.Column(db.Float, nullable=True)
    growth_5y = db.Column(db.Float, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Asset {self.name}>'
    
    def to_dict(self):
        return {
            'id': self.id,
            'sectorType': self.sector_type,
            'name': self.name,
            'price': self.price,
            'acquisitionPrice': self.acquisition_price,
            'amount': self.amount,
            'value': self.value,
            'profitLoss': self.profit_loss,
            'profitLossPercentage': self.profit_loss_percentage,
            'pe': self.pe,
            'dividendYield': self.dividend_yield,
            'growth1y': self.growth_1y,
            'growth3y': self.growth_3y,
            'growth5y': self.growth_5y
        }