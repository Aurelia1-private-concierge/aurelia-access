/**
 * Currency Converter Component
 * Full-featured currency converter with luxury market presets
 */

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRightLeft,
  RefreshCw,
  TrendingUp,
  Globe,
  Clock,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useCurrencyConverter, LUXURY_CURRENCIES } from "@/hooks/useCurrencyConverter";

interface CurrencyConverterProps {
  defaultFrom?: string;
  defaultTo?: string;
  defaultAmount?: number;
  compact?: boolean;
  showAllRates?: boolean;
  className?: string;
}

export const CurrencyConverter: React.FC<CurrencyConverterProps> = ({
  defaultFrom = "USD",
  defaultTo = "EUR",
  defaultAmount = 1000,
  compact = false,
  showAllRates = true,
  className = "",
}) => {
  const [fromCurrency, setFromCurrency] = useState(defaultFrom);
  const [toCurrency, setToCurrency] = useState(defaultTo);
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [result, setResult] = useState<number | null>(null);
  const [allRates, setAllRates] = useState<Record<string, number> | null>(null);

  const {
    isLoading,
    lastUpdated,
    convert,
    getMultipleRates,
    formatCurrency,
    getCurrencySymbol,
  } = useCurrencyConverter();

  // Handle conversion
  const handleConvert = useCallback(async () => {
    const numAmount = parseFloat(amount) || 0;
    if (numAmount <= 0) return;

    if (showAllRates) {
      const rates = await getMultipleRates(fromCurrency, numAmount);
      if (rates) {
        setAllRates(rates.conversions);
        setResult(rates.conversions[toCurrency] || null);
      }
    } else {
      const converted = await convert(fromCurrency, toCurrency, numAmount);
      setResult(converted);
    }
  }, [amount, fromCurrency, toCurrency, showAllRates, convert, getMultipleRates]);

  // Swap currencies
  const handleSwap = useCallback(() => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
    setResult(null);
    setAllRates(null);
  }, [fromCurrency, toCurrency]);

  // Quick amount buttons
  const quickAmounts = [1000, 10000, 50000, 100000];

  // Compact view
  if (compact) {
    return (
      <Card className={`bg-card/50 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="text-right"
              />
            </div>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LUXURY_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={handleSwap}>
              <ArrowRightLeft className="h-4 w-4" />
            </Button>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LUXURY_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleConvert} disabled={isLoading} size="sm">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Convert"}
            </Button>
          </div>

          {result !== null && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 text-center"
            >
              <p className="text-2xl font-bold text-primary">
                {formatCurrency(result, toCurrency)}
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full view
  return (
    <Card className={`bg-card ${className}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Globe className="h-5 w-5 text-primary" />
          Currency Converter
          {lastUpdated && (
            <Badge variant="outline" className="ml-auto text-xs font-normal">
              <Clock className="h-3 w-3 mr-1" />
              Updated {lastUpdated.toLocaleTimeString()}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Amount input */}
        <div className="space-y-2">
          <Label>Amount</Label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg"
            placeholder="Enter amount"
          />
          <div className="flex gap-2">
            {quickAmounts.map((qa) => (
              <Button
                key={qa}
                variant="outline"
                size="sm"
                onClick={() => setAmount(qa.toString())}
                className="flex-1 text-xs"
              >
                {getCurrencySymbol(fromCurrency)}
                {qa.toLocaleString()}
              </Button>
            ))}
          </div>
        </div>

        {/* Currency selectors */}
        <div className="flex items-center gap-3">
          <div className="flex-1 space-y-2">
            <Label>From</Label>
            <Select value={fromCurrency} onValueChange={setFromCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LUXURY_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono">{c.symbol}</span>
                      <span>{c.code}</span>
                      <span className="text-muted-foreground text-xs">
                        {c.name}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleSwap}
            className="mt-6"
          >
            <ArrowRightLeft className="h-4 w-4" />
          </Button>

          <div className="flex-1 space-y-2">
            <Label>To</Label>
            <Select value={toCurrency} onValueChange={setToCurrency}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LUXURY_CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    <span className="flex items-center gap-2">
                      <span className="font-mono">{c.symbol}</span>
                      <span>{c.code}</span>
                      <span className="text-muted-foreground text-xs">
                        {c.name}
                      </span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Convert button */}
        <Button
          onClick={handleConvert}
          disabled={isLoading}
          className="w-full"
          size="lg"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Converting...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Convert
            </>
          )}
        </Button>

        {/* Result */}
        <AnimatePresence mode="wait">
          {result !== null && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-primary/5 rounded-xl p-6 text-center space-y-2"
            >
              <p className="text-sm text-muted-foreground">
                {formatCurrency(parseFloat(amount) || 0, fromCurrency)} =
              </p>
              <p className="text-3xl font-bold text-primary">
                {formatCurrency(result, toCurrency)}
              </p>
              <p className="text-xs text-muted-foreground">
                1 {fromCurrency} = {allRates?.[toCurrency]?.toFixed(4)} {toCurrency}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* All rates grid */}
        {showAllRates && allRates && Object.keys(allRates).length > 0 && (
          <>
            <Separator />
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" />
                <h4 className="font-medium text-sm">All Conversions</h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {LUXURY_CURRENCIES.filter((c) => c.code !== fromCurrency).map(
                  (currency) => {
                    const rate = allRates[currency.code];
                    if (!rate) return null;
                    return (
                      <motion.div
                        key={currency.code}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`p-3 rounded-lg bg-muted/50 ${
                          currency.code === toCurrency
                            ? "ring-2 ring-primary bg-primary/10"
                            : ""
                        }`}
                        onClick={() => setToCurrency(currency.code)}
                        role="button"
                      >
                        <p className="text-xs text-muted-foreground">
                          {currency.code}
                        </p>
                        <p className="font-semibold truncate">
                          {currency.symbol}
                          {rate.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </p>
                      </motion.div>
                    );
                  }
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default CurrencyConverter;
