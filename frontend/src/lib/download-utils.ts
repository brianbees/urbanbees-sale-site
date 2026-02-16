/**
 * Utility functions for generating downloadable order summaries
 */

export interface DownloadItem {
  name: string;
  price?: number | null;
  variant?: string;
  quantity?: number;
  sku?: string;
  category?: string;
  description?: string;
}

export interface DownloadOptions {
  title: string;
  items: DownloadItem[];
  contactEmail?: string;
  includeDate?: boolean;
  includeTotals?: boolean;
}

/**
 * Generate and download a text file with the selection summary
 */
export function downloadTextSummary(options: DownloadOptions): void {
  const {
    title,
    items,
    contactEmail = 'sale@urbanbees.co.uk',
    includeDate = true,
    includeTotals = true,
  } = options;

  // Build the content
  const lines: string[] = [];
  
  // Header
  lines.push(title);
  lines.push('='.repeat(title.length));
  lines.push('');
  
  // Date
  if (includeDate) {
    const date = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    lines.push(`Date: ${date}`);
    lines.push('');
  }
  
  // Items
  items.forEach((item, idx) => {
    lines.push(`${idx + 1}. ${item.name}`);
    
    if (item.variant && item.variant !== 'Standard') {
      lines.push(`   Variant: ${item.variant}`);
    }
    
    if (item.quantity && item.quantity > 1) {
      lines.push(`   Quantity: ${item.quantity}`);
    }
    
    if (item.sku) {
      lines.push(`   SKU: ${item.sku}`);
    }
    
    if (item.category) {
      lines.push(`   Category: ${item.category}`);
    }
    
    if (item.description) {
      // Clean and format description
      const cleanDesc = item.description
        .replace(/Offers welcome.*?mailto:sales@urbanbees\.co\.uk\?subject=.*$/gim, '')
        .trim();
      if (cleanDesc) {
        lines.push(`   Description: ${cleanDesc}`);
      }
    }
    
    lines.push('');
  });
  
  // Totals
  if (includeTotals) {
    lines.push('-'.repeat(50));
    lines.push('');
    
    const totalItems = items.reduce((sum, item) => sum + (item.quantity || 1), 0);
    lines.push(`Total Items: ${totalItems}`);
    lines.push('');
  }
  
  // Footer
  lines.push('-'.repeat(50));
  lines.push('');
  lines.push('To place an order or make an enquiry, please email:');
  lines.push(contactEmail);
  lines.push('');
  lines.push('You can attach this file to your email for reference.');
  
  // Create blob and download
  const content = lines.join('\n');
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  
  // Create filename with date
  const dateStr = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  const sanitizedTitle = title.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const filename = `${sanitizedTitle}_${dateStr}.txt`;
  
  // Trigger download
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Clean up
  setTimeout(() => URL.revokeObjectURL(url), 100);
}
