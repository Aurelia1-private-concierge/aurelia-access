import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronRight, Check } from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  width?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
}

interface QuantumTableProps<T extends Record<string, any>> {
  data: T[];
  columns: Column<T>[];
  className?: string;
  selectable?: boolean;
  expandable?: boolean;
  expandedContent?: (row: T) => React.ReactNode;
  onRowClick?: (row: T, index: number) => void;
  onSelectionChange?: (selectedRows: T[]) => void;
  animated?: boolean;
  stickyHeader?: boolean;
  maxHeight?: string;
}

export const QuantumTable = <T extends Record<string, any>>({
  data,
  columns,
  className,
  selectable = false,
  expandable = false,
  expandedContent,
  onRowClick,
  onSelectionChange,
  animated = true,
  stickyHeader = false,
  maxHeight,
}: QuantumTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  const sortedData = useMemo(() => {
    if (!sortConfig) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig]);

  const handleSort = (key: string) => {
    setSortConfig((current) => {
      if (current?.key === key) {
        if (current.direction === "asc") {
          return { key, direction: "desc" };
        }
        return null;
      }
      return { key, direction: "asc" };
    });
  };

  const handleSelectAll = () => {
    if (selectedRows.size === data.length) {
      setSelectedRows(new Set());
      onSelectionChange?.([]);
    } else {
      const allIndices = new Set(data.map((_, i) => i));
      setSelectedRows(allIndices);
      onSelectionChange?.(data);
    }
  };

  const handleSelectRow = (index: number) => {
    const newSelected = new Set(selectedRows);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedRows(newSelected);
    onSelectionChange?.(data.filter((_, i) => newSelected.has(i)));
  };

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const getCellValue = (row: T, column: Column<T>, index: number) => {
    const value = row[column.key as keyof T];
    if (column.render) {
      return column.render(value, row, index);
    }
    return String(value ?? "");
  };

  return (
    <div
      className={cn(
        "relative rounded-lg border border-cyan-500/20 bg-slate-900/80 overflow-hidden",
        className
      )}
    >
      {/* Grid pattern background */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34, 211, 238, 0.3) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34, 211, 238, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />

      <div
        className={cn("relative overflow-auto", maxHeight && `max-h-[${maxHeight}]`)}
        style={maxHeight ? { maxHeight } : undefined}
      >
        <table className="w-full">
          <thead className={cn(stickyHeader && "sticky top-0 z-10")}>
            <tr className="bg-slate-950/80 border-b border-cyan-500/20">
              {/* Expand column */}
              {expandable && <th className="w-10 p-3" />}

              {/* Select column */}
              {selectable && (
                <th className="w-10 p-3">
                  <button
                    onClick={handleSelectAll}
                    className={cn(
                      "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                      selectedRows.size === data.length
                        ? "bg-cyan-500 border-cyan-500"
                        : "border-cyan-500/50 hover:border-cyan-400"
                    )}
                  >
                    {selectedRows.size === data.length && (
                      <Check className="w-3 h-3 text-slate-900" />
                    )}
                  </button>
                </th>
              )}

              {/* Data columns */}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    "p-3 text-left font-mono text-xs uppercase tracking-wider text-cyan-400",
                    column.sortable && "cursor-pointer hover:text-cyan-300 select-none"
                  )}
                  style={column.width ? { width: column.width } : undefined}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center gap-2">
                    {column.label}
                    {column.sortable && (
                      <span className="flex flex-col">
                        <ChevronUp
                          className={cn(
                            "w-3 h-3 -mb-1",
                            sortConfig?.key === column.key &&
                              sortConfig.direction === "asc"
                              ? "text-cyan-400"
                              : "text-slate-600"
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            "w-3 h-3",
                            sortConfig?.key === column.key &&
                              sortConfig.direction === "desc"
                              ? "text-cyan-400"
                              : "text-slate-600"
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {sortedData.map((row, rowIndex) => (
              <AnimatePresence key={rowIndex}>
                <motion.tr
                  initial={animated ? { opacity: 0, x: -20 } : undefined}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: rowIndex * 0.03 }}
                  onMouseEnter={() => setHoveredRow(rowIndex)}
                  onMouseLeave={() => setHoveredRow(null)}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  className={cn(
                    "border-b border-cyan-500/10 transition-colors relative",
                    onRowClick && "cursor-pointer",
                    hoveredRow === rowIndex && "bg-cyan-500/5",
                    selectedRows.has(rowIndex) && "bg-cyan-500/10"
                  )}
                >
                  {/* Expand button */}
                  {expandable && (
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleExpand(rowIndex);
                        }}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors"
                      >
                        <motion.div
                          animate={{ rotate: expandedRows.has(rowIndex) ? 90 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </motion.div>
                      </button>
                    </td>
                  )}

                  {/* Select checkbox */}
                  {selectable && (
                    <td className="p-3">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectRow(rowIndex);
                        }}
                        className={cn(
                          "w-5 h-5 rounded border-2 flex items-center justify-center transition-all",
                          selectedRows.has(rowIndex)
                            ? "bg-cyan-500 border-cyan-500"
                            : "border-cyan-500/50 hover:border-cyan-400"
                        )}
                      >
                        {selectedRows.has(rowIndex) && (
                          <Check className="w-3 h-3 text-slate-900" />
                        )}
                      </button>
                    </td>
                  )}

                  {/* Data cells */}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className="p-3 font-mono text-sm text-slate-300"
                    >
                      {getCellValue(row, column, rowIndex)}
                    </td>
                  ))}

                  {/* Scanning highlight effect */}
                  {hoveredRow === rowIndex && (
                    <motion.div
                      layoutId="table-row-highlight"
                      className="absolute inset-0 pointer-events-none"
                    >
                      <motion.div
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="absolute inset-y-0 w-1/4 bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent"
                      />
                    </motion.div>
                  )}
                </motion.tr>

                {/* Expanded content */}
                {expandable && expandedRows.has(rowIndex) && expandedContent && (
                  <motion.tr
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <td
                      colSpan={columns.length + (selectable ? 2 : 1)}
                      className="p-4 bg-slate-950/50 border-b border-cyan-500/10"
                    >
                      {expandedContent(row)}
                    </td>
                  </motion.tr>
                )}
              </AnimatePresence>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom scan line */}
      <div className="relative h-1 bg-slate-950 overflow-hidden">
        <motion.div
          animate={{ x: ["-100%", "100%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
        />
      </div>
    </div>
  );
};

export default QuantumTable;
