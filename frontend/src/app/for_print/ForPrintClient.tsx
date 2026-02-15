"use client";
import React from "react";

interface Product {
  id: string;
  name: string;
  description: string;
  images?: string[];
  price?: number;
  sku?: string;
  quantity?: number;
  category?: string;
}

interface ForPrintClientProps {
  products: Product[];
  mode?: 'all' | 'wishlist';
}

export default function ForPrintClient({ products, mode = 'all' }: ForPrintClientProps) {
  const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const listTitle = mode === 'wishlist' ? 'Wishlist' : 'Product Catalogue';
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="for-print-container">
      {/* Print Header */}
      <div className="for-print-header">
        <h1>{listTitle}</h1>
        <p className="for-print-date">{currentDate} • {products.length} items</p>
      </div>

      {/* Column Headers */}
      <div className="for-print-headers">
        <div className="for-print-checkbox-col">☐</div>
        <div className="for-print-img-col"></div>
        <div className="for-print-name-col">Product</div>
        <div className="for-print-details-col">Description</div>
        <div className="for-print-price-col">Price</div>
        <div className="for-print-sku-col">SKU</div>
        <div className="for-print-quantity-col">Stock</div>
      </div>

      <div className="for-print-list">
        {products.map((product, idx) => (
          <React.Fragment key={product.id}>
            <div className="for-print-item">
              <div className="for-print-checkbox">
                <input type="checkbox" className="print-checkbox" />
              </div>
              <div className="for-print-img-holder">
                <img
                  src={product.images?.[0] || '/placeholder.jpg'}
                  alt={product.name}
                  className="for-print-img"
                  style={{ objectFit: 'cover', borderRadius: 8, height: '50px', width: '50px' }}
                />
              </div>
              <div className="for-print-name">
                <h2>{product.name}</h2>
                {product.category && <p className="for-print-category">{product.category}</p>}
              </div>
              <div className="for-print-details">
                <p>{product.description}</p>
              </div>
              <div className="for-print-price">
                <p>{product.price !== undefined ? `£${product.price.toFixed(2)}` : '-'}</p>
              </div>
              <div className="for-print-sku">
                <p>{product.sku || '-'}</p>
              </div>
              <div className="for-print-quantity">
                <p>{product.quantity !== undefined ? product.quantity : '-'}</p>
              </div>
            </div>
            {idx < products.length - 1 && <hr className="for-print-divider" />}
          </React.Fragment>
        ))}
      </div>

      {/* Footer with total */}
      {mode === 'wishlist' && (
        <div className="for-print-footer">
          <div className="for-print-total">
            <strong>Total:</strong> £{totalPrice.toFixed(2)}
          </div>
        </div>
      )}
      <style jsx>{`
        .for-print-container {
          padding: 20px;
          font-family: Arial, sans-serif;
          max-width: 1200px;
          margin: 0 auto;
        }
        .for-print-header {
          margin-bottom: 20px;
          border-bottom: 2px solid #333;
          padding-bottom: 10px;
        }
        .for-print-header h1 {
          margin: 0;
          font-size: 24px;
        }
        .for-print-date {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 14px;
        }
        .for-print-headers {
          display: grid;
          grid-template-columns: 30px 50px 180px 1fr 80px 80px 80px;
          align-items: center;
          gap: 8px;
          font-weight: bold;
          padding: 10px 0;
          border-bottom: 1px solid #333;
          margin-bottom: 10px;
        }
        .for-print-price-col, .for-print-sku-col, .for-print-quantity-col {
          text-align: center;
        }
        .for-print-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .for-print-item {
          display: grid;
          grid-template-columns: 30px 50px 180px 1fr 80px 80px 80px;
          align-items: center;
          gap: 8px;
          page-break-inside: avoid;
        }
        .for-print-checkbox {
          text-align: center;
        }
        .print-checkbox {
          width: 18px;
          height: 18px;
          cursor: pointer;
        }
        .for-print-price, .for-print-sku, .for-print-quantity {
          text-align: center;
        }
        .for-print-img-holder {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50px;
        }
        .for-print-img {
          border: 1px solid #ccc;
          height: 50px;
          width: 50px;
        }
        .for-print-name {
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .for-print-name h2 {
          margin: 0;
          font-size: 16px;
        }
        .for-print-category {
          margin: 2px 0 0 0;
          font-size: 12px;
          color: #666;
        }
        .for-print-details {
          max-width: 600px;
          font-size: 14px;
        }
        .for-print-divider {
          border: none;
          border-top: 1px solid #ddd;
          margin: 4px 0;
        }
        .for-print-footer {
          margin-top: 20px;
          padding-top: 10px;
          border-top: 2px solid #333;
          text-align: right;
        }
        .for-print-total {
          font-size: 18px;
          padding: 10px;
        }
        @media screen {
          .for-print-container {
            background: white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          }
        }
        @media print {
          body * {
            visibility: hidden;
          }
          .for-print-container, .for-print-container * {
            visibility: visible;
          }
          .for-print-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}