// Google Analytics 4 Event Tracking
// Measurement ID: G-8BMV22MY3X

declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

// Track page views (called automatically by GA4, but can be called manually if needed)
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', 'G-8BMV22MY3X', {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};

// E-commerce event tracking
export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number) => {
  trackEvent('add_to_cart', {
    currency: 'GBP',
    value: price * quantity,
    items: [
      {
        item_id: productId,
        item_name: productName,
        price: price,
        quantity: quantity,
      },
    ],
  });
};

export const trackRemoveFromCart = (productId: string, productName: string, price: number, quantity: number) => {
  trackEvent('remove_from_cart', {
    currency: 'GBP',
    value: price * quantity,
    items: [
      {
        item_id: productId,
        item_name: productName,
        price: price,
        quantity: quantity,
      },
    ],
  });
};

export const trackViewItem = (productId: string, productName: string, price: number | null, category: string) => {
  trackEvent('view_item', {
    currency: 'GBP',
    value: price || 0,
    items: [
      {
        item_id: productId,
        item_name: productName,
        item_category: category,
        price: price || 0,
      },
    ],
  });
};

export const trackBeginCheckout = (items: Array<{ productId: string; productName: string; price: number; quantity: number }>, totalValue: number) => {
  trackEvent('begin_checkout', {
    currency: 'GBP',
    value: totalValue,
    items: items.map(item => ({
      item_id: item.productId,
      item_name: item.productName,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackPurchase = (orderId: string, items: Array<{ productId: string; productName: string; price: number; quantity: number }>, totalValue: number) => {
  trackEvent('purchase', {
    transaction_id: orderId,
    currency: 'GBP',
    value: totalValue,
    items: items.map(item => ({
      item_id: item.productId,
      item_name: item.productName,
      price: item.price,
      quantity: item.quantity,
    })),
  });
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};
