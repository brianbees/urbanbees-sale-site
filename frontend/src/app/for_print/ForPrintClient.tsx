"use client";
import React from "react";
import { useRouter } from 'next/navigation';

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
  const router = useRouter();
  const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const listTitle = mode === 'wishlist' ? 'Wishlist' : 'Product Catalogue';
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // Build email body with product list
    const emailBody = products.map((product, idx) => {
      return `${idx + 1}. ${product.name}${product.price ? ` - £${product.price.toFixed(2)}` : ''}${product.sku ? ` (SKU: ${product.sku})` : ''}${product.description ? `\n   ${product.description}` : ''}`;
    }).join('\n\n');
    
    const totalText = mode === 'wishlist' 
      ? `\n\n----------\nTotal: £${totalPrice.toFixed(2)}\n\nItems: ${products.length}`
      : '';

    const fullBody = `Hello,\n\nI am interested in the following products:\n\n${emailBody}${totalText}\n\nThank you.`;
    
    const mailtoLink = `mailto:sale@urbanbees.co.uk?subject=${encodeURIComponent('I am interested in these products')}&body=${encodeURIComponent(fullBody)}`;
    
    // Use window.open for better PC browser compatibility
    window.open(mailtoLink, '_self');
  };

  return (
    <div className="for-print-wrapper">
      {/* Print Controls - Hidden when printing */}
      <div className="print-controls no-print">
        <button
          onClick={() => router.back()}
          className="back-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <div className="action-buttons">
          <button
            onClick={handleEmail}
            className="email-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Email List
          </button>
          <button
            onClick={handlePrint}
            className="print-button"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zm0 8H7v4h6v-4z" clipRule="evenodd" />
            </svg>
            Print List
          </button>
        </div>
      </div>

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
      </div>

      <style jsx>{`
        .for-print-wrapper {
          min-height: 100vh;
          background: #f3f4f6;
          padding: 20px;
        }
        .print-controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto 20px;
          padding: 15px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .action-buttons {
          display: flex;
          gap: 10px;
        }
        .back-button, .print-button, .email-button {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          border: none;
          border-radius: 6px;
          font-size: 16px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-button {
          background: #e5e7eb;
          color: #374151;
        }
        .back-button:hover {
          background: #d1d5db;
        }
        .email-button {
          background: #2563eb;
          color: white;
        }
        .email-button:hover {
          background: #1d4ed8;
        }
        .print-button {
          background: #1f2937;
          color: white;
        }
        .print-button:hover {
          background: #111827;
        }
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
            border-radius: 8px;
          }
        }
        @media print {
          .for-print-wrapper {
            background: white;
            padding: 0;
          }
          .print-controls {
            display: none !important;
          }
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
            padding: 10px;
          }
        }
      `}</style>
    </div>
  );
}