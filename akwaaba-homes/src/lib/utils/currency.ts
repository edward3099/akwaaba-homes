import { CurrencyCode, CurrencyRate } from '../types';

// Default currency rates (GHS as base currency = 1)
// In production, these would come from a real-time API
export const DEFAULT_CURRENCY_RATES: Record<CurrencyCode, CurrencyRate> = {
  GHS: {
    code: 'GHS',
    rate: 1,
    symbol: '₵',
    name: 'Ghana Cedi'
  },
  USD: {
    code: 'USD',
    rate: 0.062, // 1 GHS = 0.062 USD (example rate)
    symbol: '$',
    name: 'US Dollar'
  },
  GBP: {
    code: 'GBP',
    rate: 0.049, // 1 GHS = 0.049 GBP (example rate)
    symbol: '£',
    name: 'British Pound'
  },
  EUR: {
    code: 'EUR',
    rate: 0.058, // 1 GHS = 0.058 EUR (example rate)
    symbol: '€',
    name: 'Euro'
  }
};

/**
 * Convert amount from GHS to target currency
 */
export function convertCurrency(
  amountInGHS: number,
  targetCurrency: CurrencyCode,
  rates: Record<CurrencyCode, CurrencyRate> = DEFAULT_CURRENCY_RATES
): number {
  if (targetCurrency === 'GHS') return amountInGHS;
  
  const rate = rates[targetCurrency]?.rate;
  if (!rate) throw new Error(`Currency rate not found for ${targetCurrency}`);
  
  return amountInGHS * rate;
}

/**
 * Convert amount from any currency to GHS
 */
export function convertToGHS(
  amount: number,
  fromCurrency: CurrencyCode,
  rates: Record<CurrencyCode, CurrencyRate> = DEFAULT_CURRENCY_RATES
): number {
  if (fromCurrency === 'GHS') return amount;
  
  const rate = rates[fromCurrency]?.rate;
  if (!rate) throw new Error(`Currency rate not found for ${fromCurrency}`);
  
  return amount / rate;
}

/**
 * Format currency amount with proper symbol and formatting
 */
export function formatCurrency(
  amount: number,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, CurrencyRate> = DEFAULT_CURRENCY_RATES,
  options: {
    showDecimals?: boolean;
    showCurrencyCode?: boolean;
    compact?: boolean;
  } = {}
): string {
  const {
    showDecimals = true,
    showCurrencyCode = false,
    compact = false
  } = options;

  const currencyInfo = rates[currency];
  if (!currencyInfo) return amount.toString();

  const convertedAmount = convertCurrency(amount, currency, rates);
  
  // Format large numbers in compact form (e.g., 1.2M, 450K)
  if (compact && convertedAmount >= 1000) {
    const formatted = formatCompactNumber(convertedAmount);
    return `${currencyInfo.symbol}${formatted}${showCurrencyCode ? ` ${currency}` : ''}`;
  }

  // Regular formatting
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0
  });

  const formattedAmount = formatter.format(convertedAmount);
  
  return `${currencyInfo.symbol}${formattedAmount}${showCurrencyCode ? ` ${currency}` : ''}`;
}

/**
 * Format number in compact form (1.2M, 450K, etc.)
 */
function formatCompactNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(0) + 'K';
  }
  return num.toString();
}

/**
 * Get currency display options for price ranges
 */
export function formatPriceRange(
  minPrice: number,
  maxPrice: number,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, CurrencyRate> = DEFAULT_CURRENCY_RATES
): string {
  const min = formatCurrency(minPrice, currency, rates, { 
    showDecimals: false, 
    compact: true 
  });
  const max = formatCurrency(maxPrice, currency, rates, { 
    showDecimals: false, 
    compact: true 
  });
  
  return `${min} - ${max}`;
}

/**
 * Parse currency input string to number (handles symbols and formatting)
 */
export function parseCurrencyInput(
  input: string,
  currency: CurrencyCode,
  rates: Record<CurrencyCode, CurrencyRate> = DEFAULT_CURRENCY_RATES
): number {
  // Remove currency symbols and whitespace
  const cleaned = input
    .replace(/[₵$£€,\s]/g, '')
    .replace(/[KkMm]$/, (match) => {
      return match.toLowerCase() === 'k' ? '000' : '000000';
    });
  
  const parsed = parseFloat(cleaned);
  if (isNaN(parsed)) return 0;
  
  // Convert to GHS if input was in different currency
  return convertToGHS(parsed, currency, rates);
}

/**
 * Get all available currencies for dropdown/selection
 */
export function getAvailableCurrencies(
  rates: Record<CurrencyCode, CurrencyRate> = DEFAULT_CURRENCY_RATES
): CurrencyRate[] {
  return Object.values(rates);
}

/**
 * Detect user's preferred currency based on location
 */
export function getPreferredCurrency(countryCode?: string): CurrencyCode {
  const currencyMap: Record<string, CurrencyCode> = {
    'GH': 'GHS', // Ghana
    'US': 'USD', // United States
    'GB': 'GBP', // United Kingdom
    'UK': 'GBP', // United Kingdom (alternative)
    'FR': 'EUR', // France
    'DE': 'EUR', // Germany
    'IT': 'EUR', // Italy
    'ES': 'EUR', // Spain
    'NL': 'EUR', // Netherlands
    'AT': 'EUR', // Austria
    'BE': 'EUR', // Belgium
    'FI': 'EUR', // Finland
    'IE': 'EUR', // Ireland
    'LU': 'EUR', // Luxembourg
    'PT': 'EUR', // Portugal
  };

  return currencyMap[countryCode?.toUpperCase() || ''] || 'GHS';
}

/**
 * Format currency for diaspora display (shows multiple currencies)
 */
export function formatDiasporaPrice(
  priceInGHS: number,
  primaryCurrency: CurrencyCode = 'GHS',
  rates: Record<CurrencyCode, CurrencyRate> = DEFAULT_CURRENCY_RATES
): {
  primary: string;
  alternatives: Array<{ currency: CurrencyCode; formatted: string }>;
} {
  const primary = formatCurrency(priceInGHS, primaryCurrency, rates, {
    compact: true,
    showDecimals: false
  });

  const alternatives = (['USD', 'GBP', 'EUR'] as CurrencyCode[])
    .filter(curr => curr !== primaryCurrency)
    .map(currency => ({
      currency,
      formatted: formatCurrency(priceInGHS, currency, rates, {
        compact: true,
        showDecimals: false
      })
    }));

  return { primary, alternatives };
}

/**
 * Fetch admin-configured currency rates from platform settings
 */
export async function fetchAdminCurrencyRates(): Promise<Record<CurrencyCode, CurrencyRate>> {
  try {
    const response = await fetch('/api/admin/settings');
    
    if (!response.ok) {
      console.warn('Failed to fetch admin currency rates, using defaults');
      return DEFAULT_CURRENCY_RATES;
    }
    
    const data = await response.json();
    const currencyRates = data.settings?.currency_rates;
    
    if (!currencyRates) {
      console.warn('No currency rates found in admin settings, using defaults');
      return DEFAULT_CURRENCY_RATES;
    }
    
    // Convert admin rates to our format (admin stores rates as foreign_currency_to_ghs)
    const rates: Record<CurrencyCode, CurrencyRate> = {
      GHS: {
        code: 'GHS',
        rate: 1,
        symbol: '₵',
        name: 'Ghana Cedi'
      },
      USD: {
        code: 'USD',
        rate: 1 / currencyRates.usd_to_ghs, // Convert from USD->GHS to GHS->USD
        symbol: '$',
        name: 'US Dollar'
      },
      GBP: {
        code: 'GBP',
        rate: 1 / currencyRates.gbp_to_ghs, // Convert from GBP->GHS to GHS->GBP
        symbol: '£',
        name: 'British Pound'
      },
      EUR: {
        code: 'EUR',
        rate: 1 / currencyRates.eur_to_ghs, // Convert from EUR->GHS to GHS->EUR
        symbol: '€',
        name: 'Euro'
      }
    };
    
    console.log('✅ Using admin-configured currency rates:', {
      USD: `1 GHS = ${rates.USD.rate.toFixed(4)} USD`,
      GBP: `1 GHS = ${rates.GBP.rate.toFixed(4)} GBP`,
      EUR: `1 GHS = ${rates.EUR.rate.toFixed(4)} EUR`
    });
    
    return rates;
  } catch (error) {
    console.error('❌ Failed to fetch admin currency rates, using defaults:', error);
    return DEFAULT_CURRENCY_RATES;
  }
}

/**
 * Fetch real-time currency rates from ExchangeRate-API
 * Free tier: 1,500 requests/month, no API key required
 */
export async function fetchCurrencyRates(): Promise<Record<CurrencyCode, CurrencyRate>> {
  try {
    // Fetch rates from ExchangeRate-API (GHS as base currency)
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/GHS');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Convert API response to our format
    const rates: Record<CurrencyCode, CurrencyRate> = {
      GHS: {
        code: 'GHS',
        rate: 1,
        symbol: '₵',
        name: 'Ghana Cedi'
      },
      USD: {
        code: 'USD',
        rate: data.rates.USD || 0.062,
        symbol: '$',
        name: 'US Dollar'
      },
      GBP: {
        code: 'GBP',
        rate: data.rates.GBP || 0.049,
        symbol: '£',
        name: 'British Pound'
      },
      EUR: {
        code: 'EUR',
        rate: data.rates.EUR || 0.058,
        symbol: '€',
        name: 'Euro'
      }
    };
    
    console.log('✅ Fetched live currency rates:', {
      USD: `1 GHS = ${rates.USD.rate} USD`,
      GBP: `1 GHS = ${rates.GBP.rate} GBP`,
      EUR: `1 GHS = ${rates.EUR.rate} EUR`
    });
    
    return rates;
  } catch (error) {
    console.error('❌ Failed to fetch currency rates, using defaults:', error);
    return DEFAULT_CURRENCY_RATES;
  }
}
