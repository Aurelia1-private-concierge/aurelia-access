import { useGlobal } from "@/contexts/GlobalContext";

interface CurrencyDisplayProps {
  amount: number;
  className?: string;
  showSymbol?: boolean;
}

const CurrencyDisplay = ({ amount, className = "", showSymbol = true }: CurrencyDisplayProps) => {
  const { formatCurrency, currencySymbol } = useGlobal();
  
  if (showSymbol) {
    return <span className={className}>{formatCurrency(amount)}</span>;
  }
  
  return (
    <span className={className}>
      {currencySymbol}{amount.toLocaleString()}
    </span>
  );
};

export default CurrencyDisplay;
