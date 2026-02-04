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
}

export default function ForPrintClient({ products }: { products: Product[] }) {
  return (
    <div className="for-print-container">
      <div className="for-print-list">
        {products.map((product, idx) => (
          <React.Fragment key={product.id}>
            <div className="for-print-item">
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
              </div>
              <div className="for-print-details">
                <p>{product.description}</p>
              </div>
              <div className="for-print-price">
                <p>{product.price !== undefined ? `£${product.price}` : '-'}</p>
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
      <style jsx>{`
        .for-print-container {
          padding: 0;
          font-family: Arial, sans-serif;
        }
        .for-print-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .for-print-item {
          display: grid;
          grid-template-columns: 50px 180px 1fr 80px 80px 80px;
          align-items: center;
          gap: 8px;
          page-break-inside: avoid;
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
          align-items: center;
        }
        .for-print-details {
          max-width: 600px;
        }
        .for-print-divider {
          border: none;
          border-top: 1px solid #ddd;
          margin: 4px 0;
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
          }
        }
      `}</style>
    </div>
  );
}