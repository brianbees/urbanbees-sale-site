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
  preview?: boolean;
}

export default function ForPrintClient({ products, mode = 'all', preview = false }: ForPrintClientProps) {
  const router = useRouter();
  const totalPrice = products.reduce((sum, p) => sum + (p.price || 0), 0);
  const baseTitle = mode === 'wishlist' ? 'Wishlist' : 'Full Product Catalogue';
  const listTitle = preview ? `Print Preview - ${baseTitle}` : baseTitle;
  const currentDate = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  // Clean description by removing offer text for print view
  const cleanDescription = (desc: string) => {
    if (!desc) return desc;
    // Remove the "Offers welcome - get in touch - mailto:..." line
    return desc
      .replace(/Offers welcome.*?mailto:sales@urbanbees\.co\.uk\?subject=.*$/gim, '')
      .replace(/\n\s*\n\s*\n/g, '\n\n') // Clean up multiple blank lines
      .trim();
  };

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmail = () => {
    // Build email body with product list
    const emailBody = products.map((product, idx) => {
      return `${idx + 1}. ${product.name}${product.price ? ` - £${product.price.toFixed(2)}` : ''}${product.sku ? ` (SKU: ${product.sku})` : ''}${product.description ? `\n   ${product.description}` : ''}`;
    }).join('\n\n');
    
    const totalText = mode === 'wishlist' 
      ? `\n\n----------\nItems: ${products.length}`
      : '';

    const fullBody = `Hello,\n\nI am interested in the following products:\n\n${emailBody}${totalText}\n\nThank you.`;
    
    const mailtoLink = `mailto:sale@urbanbees.co.uk?subject=${encodeURIComponent('I am interested in these products')}&body=${encodeURIComponent(fullBody)}`;
    
    // Use anchor element click for better PC browser compatibility
    const link = document.createElement('a');
    link.href = mailtoLink;
    link.click();
  };

  return (
    <div className="for-print-wrapper">
      {/* Print Controls - Hidden when printing */}
      <div className="print-controls no-print">
        <button
          onClick={handleBack}
          className="back-button"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back
        </button>
        <div className="action-buttons">
          <button
            onClick={handleEmail}
            className="action-link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
            </svg>
            Email List
          </button>
          <button
            onClick={handlePrint}
            className="action-link"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
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
      {mode === 'wishlist' ? (
        <div className="for-print-headers">
          {!preview && <div className="for-print-checkbox-col">☐</div>}
          <div className="for-print-img-col"></div>
          <div className="for-print-name-col">Product</div>
          <div className="for-print-details-col">Description</div>
          {!preview && <div className="for-print-price-col">Price</div>}
          {!preview && <div className="for-print-sku-col">SKU</div>}
          {!preview && <div className="for-print-quantity-col">Stock</div>}
        </div>
      ) : null}

      <div className="for-print-list">
        {products.map((product, idx) => (
          <React.Fragment key={product.id}>
            {mode === 'wishlist' ? (
              <div className="for-print-item">
                {!preview && (
                  <div className="for-print-checkbox">
                    <input type="checkbox" className="print-checkbox" />
                  </div>
                )}
                <div className="for-print-img-holder">
                  <img
                    src={product.images?.[0] || '/images/placeholder.jpg'}
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
                  <p>{cleanDescription(product.description || '')}</p>
                </div>
                {!preview && (
                  <div className="for-print-price">
                    <p>{product.price != null ? `£${product.price.toFixed(2)}` : '-'}</p>
                  </div>
                )}
                {!preview && (
                  <div className="for-print-sku">
                    <p>{product.sku || '-'}</p>
                  </div>
                )}
                {!preview && (
                  <div className="for-print-quantity">
                    <p>{product.quantity != null ? product.quantity : '-'}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="compact-item">
                <div className="compact-img">
                  <img
                    src={product.images?.[0] || '/images/placeholder.jpg'}
                    alt={product.name}
                  />
                </div>
                <div className="compact-info">
                  <h3>{product.name}</h3>
                  {product.category && <span className="compact-category">{product.category}</span>}
                  {product.description && (
                    <p className="compact-desc">{cleanDescription(product.description)}</p>
                  )}
                  {!preview && product.price != null && (
                    <p className="compact-price">£{product.price.toFixed(2)}</p>
                  )}
                </div>
              </div>
            )}
            {idx < products.length - 1 && <hr className="for-print-divider" />}
          </React.Fragment>
        ))}
      </div>

      {/* Footer with total */}
      {mode === 'wishlist' && !preview && (
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
          gap: 15px;
        }
        .back-button, .action-link {
          display: flex;
          align-items: center;
          gap: 6px;
          border: none;
          background: none;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .back-button {
          padding: 8px 16px;
          background: #e5e7eb;
          color: #374151;
          border-radius: 6px;
          font-weight: 500;
        }
        .back-button:hover {
          background: #d1d5db;
        }
        .action-link {
          color: #2563eb;
          text-decoration: underline;
          padding: 0;
        }
        .action-link:hover {
          color: #1d4ed8;
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
          grid-template-columns: ${mode === 'wishlist' && !preview ? '30px ' : ''}50px 180px 1fr ${preview ? '' : '80px 80px 80px'};
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
          grid-template-columns: ${mode === 'wishlist' && !preview ? '30px ' : ''}50px 180px 1fr ${preview ? '' : '80px 80px 80px'};
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
        .compact-item {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          page-break-inside: avoid;
          padding: 8px 0;
        }
        .compact-img {
          flex-shrink: 0;
          width: 30px;
          height: 30px;
        }
        .compact-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          border-radius: 4px;
          border: 1px solid #ccc;
        }
        .compact-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        @media (min-width: 768px) {
          .compact-info {
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            gap: 12px;
          }
          .compact-info h3 {
            flex: 0 0 auto;
            max-width: 250px;
          }
          .compact-category {
            flex: 0 0 auto;
          }
          .compact-desc {
            flex: 1 1 auto;
          }
          .compact-price {
            flex: 0 0 auto;
            margin: 0;
          }
        }
        .compact-info h3 {
          margin: 0;
          font-size: 14px;
          font-weight: bold;
          color: #333;
        }
        .compact-category {
          font-size: 11px;
          color: #666;
          font-style: italic;
        }
        .compact-desc {
          margin: 0;
          font-size: 12px;
          color: #555;
          line-height: 1.4;
        }
        .compact-price {
          margin: 4px 0 0 0;
          font-size: 13px;
          font-weight: bold;
          color: #2563eb;
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