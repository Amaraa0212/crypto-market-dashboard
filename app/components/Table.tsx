"use client";

import Image from "next/image";
import Chart from "./Chart";
import Modal from "./Modal";
import { useEffect, useState , useRef } from "react";

export interface Ticker {
  s: string; 
  c: string; 
  P: string; 
  q: string;
}

interface TableProps {
  initialTickers: Ticker[];
  itemsPerPage?: number;
}

type SortField = "symbol" | "price" | "change" | "volume" | "";
type SortDirection = "asc" | "desc";

interface KlineData {
    name: string;
    price: number;
}

export default function Table({ initialTickers, itemsPerPage = 10 }: TableProps) {
  const [tickers, setTickers] = useState<Ticker[]>(initialTickers);
  const [displayTickers, setDisplayTickers] = useState<Ticker[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<SortField>("");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [chartData, setChartData] = useState<Record<string, KlineData[]>>({});
  const [selectedCoin, setSelectedCoin] = useState<Ticker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1);
  };

  const formatMoney = (num:any) =>  {
    if (num >= 1e9) {
      return (num / 1e9).toFixed(2) + "B";
    } else if (num >= 1e6) {
      return (num / 1e6).toFixed(2) + "M";
    } else if (num >= 1e3) {
      return (num / 1e3).toFixed(2) + "K";
    } else {
      return num.toString();
    }
  }

  useEffect(() => {
    setTickers(initialTickers);
  }, [initialTickers]);

  useEffect(() => {
    const filtered = tickers.filter(c =>
      c.s.endsWith("USDT") &&
      c.s.toLowerCase().includes(searchTerm.toLowerCase()) 
    );

    const sorted = [...filtered].sort((a, b) => {
      const getValue = (t: Ticker, field: SortField) => {
        switch (field) {
          case "symbol": return t.s;
          case "price": return parseFloat(t.c);
          case "change": return parseFloat(t.P);
          case "volume": return parseFloat(t.q);
        }
      };

      const valA = getValue(a, sortField);
      const valB = getValue(b, sortField);

      if (valA === undefined || valB === undefined) return 0;

      if (typeof valA === "string")
        return sortDirection === "asc"
          ? valA.localeCompare(valB as string)
          : (valB as string).localeCompare(valA);
      return sortDirection === "asc"
        ? (valA as number) - (valB as number)
        : (valB as number) - (valA as number);
    });

    // 3️⃣ paginate
    const paginated = sorted.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );

    setDisplayTickers(paginated);
  }, [tickers, sortField, sortDirection, currentPage, itemsPerPage, searchTerm])

  const totalPages = Math.ceil(
    tickers.filter(c => c.s.endsWith("USDT")).length / itemsPerPage
  );

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");
    ws.onmessage = (event) => {
      const updates: Ticker[] = JSON.parse(event.data);
      setTickers(prev =>
        prev.map(t => {
          const update = updates.find(u => u.s === t.s);
          return update ? { ...t, ...update } : t;
        })
      );
    };
    return () => ws.close();
  }, []);

  useEffect(() => {
    displayTickers.forEach(async (coin) => {
      const symbol = coin.s;
      if (chartData[symbol]) return; 

      try {
        const res = await fetch(`https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=7`);
        const data = await res.json();
        const formatted: KlineData[] = data.map((c: any) => ({
          name: new Date(c[0]).toLocaleDateString(),
          price: parseFloat(c[4]),
        }));
        setChartData(prev => ({ ...prev, [symbol]: formatted }));
      } catch (e) {
        console.error("Failed to fetch kline data", symbol, e);
      }
    });
  }, [displayTickers, chartData]);

  return (
    <div className="px-4 relative flex justify-center p-5 mt-4 rounded-2xl [background:linear-gradient(45deg,#0f1123,theme(colors.slate.800)_50%,#0f1123)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] border border-transparent animate-border">
      <div className="tabs-container absolute top-[-14px]">
        <button className={`tab ${sortField == '' ? 'active' : ''}`} onClick={() => handleSort("")}>All Coins</button>
        <button className={`tab ${sortField == 'symbol' ? 'active' : ''}`} onClick={() => handleSort("symbol")}>Symbol</button>
        <button className={`tab ${sortField == 'price' ? 'active' : ''}`} onClick={() => handleSort("price")}>Price</button>
        <button className={`tab ${sortField == 'change' ? 'active' : ''}`} onClick={() => handleSort("change")}>Change(24)</button>
        <button className={`tab ${sortField == 'volume' ? 'active' : ''}`} onClick={() => handleSort("volume")}>Volume</button>
      </div>
      <div className="w-full">
        <div className="flex w-full mb-5 mt-5 items-center justify-between">
          <p className="font-bold text-md">Market Capitalization</p>
          <form className="input-width ">   
              <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
              <div className="relative ">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                      </svg>
                  </div>
                  <input 
                      type="search" 
                      id="default-search" 
                      className="block w-full py-3! px-10! tab text-sm text-gray-900 border border-gray-300 rounded-lg " 
                      placeholder="Search Coin name..." 
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }} />
              </div>
          </form>
          <div className="relative filter-icon" ref={dropdownRef}>
            <button
              onClick={() => setOpen(!open)}
              className={`tab p-2 rounded-md hover:bg-gray-800 transition ${open ? "bg-gray-700" : ""}`}
            >
              <svg
                className="w-6 h-6 text-gray-800 dark:text-white"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M5.05 3C3.291 3 2.352 5.024 3.51 6.317l5.422 6.059v4.874c0 .472.227.917.613 1.2l3.069 2.25c1.01.742 2.454.036 2.454-1.2v-7.124l5.422-6.059C21.647 5.024 20.708 3 18.95 3H5.05Z" />
              </svg>
            </button>

            {open && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-900 text-white border border-slate-700 rounded-lg shadow-lg z-50 p-3 animate-fade-in">
                <form>
                  <label htmlFor="search" className="sr-only">
                    Search
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-400"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 20 20"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                        />
                      </svg>
                    </div>
                    <input
                      type="search"
                      id="search"
                      placeholder="Search Coin name..."
                      className="block w-full pl-10 pr-3 py-2 rounded-lg bg-slate-800 border border-slate-600 text-sm placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </form>
                <div className="mt-4">
                  <button className={`tab mr-2 mb-2 ${sortField == '' ? 'active' : ''}`} onClick={() => handleSort("")}>All Coins</button>
                  <button className={`tab mr-2 mb-2 ${sortField == 'symbol' ? 'active' : ''}`} onClick={() => handleSort("symbol")}>Symbol</button>
                  <button className={`tab mr-2 mb-2 ${sortField == 'price' ? 'active' : ''}`} onClick={() => handleSort("price")}>Price</button>
                  <button className={`tab mr-2 mb-2 ${sortField == 'change' ? 'active' : ''}`} onClick={() => handleSort("change")}>Change(24)</button>
                  <button className={`tab mr-2 mb-2 ${sortField == 'volume' ? 'active' : ''}`} onClick={() => handleSort("volume")}>Volume</button>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div className="table-container overflow-x-auto w-full">
          <table className="relative w-full min-w-[300px] border-separate border-spacing-y-3 text-white">
            <thead className="text-xs">
              <tr>
                <th className="cursor-pointer sticky left-0 text-left" onClick={() => handleSort("symbol")}>
                  Symbol {sortField === "symbol" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="cursor-pointer text-left" onClick={() => handleSort("price")}>
                  Price {sortField === "price" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="cursor-pointer hide-item text-left" onClick={() => handleSort("change")}>
                  Chg(24) {sortField === "change" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="cursor-pointer hide-item text-left" onClick={() => handleSort("volume")}>
                  Volume {sortField === "volume" ? (sortDirection === "asc" ? "↑" : "↓") : ""}
                </th>
                <th className="hide-item">Price Graph</th>
                <th className="show-mobile text-right">Chg(24) / Volume</th>
              </tr>
            </thead>

            <tbody>
              {displayTickers.map((coin) => {
                const change = parseFloat(coin.P);
                const isUp = change >= 0;
                const symbol = coin.s.replace("USDT", "");
                const chartsym = coin.s
                return (
                  <tr key={coin.s} className="hover:bg-[#1a1e3a] transition">
                    <td className="sticky bg-[#1c243c] rounded-bl-2xl left-0">
                      <div onClick={() => setSelectedCoin(coin)} className="flex cursor-pointer items-center gap-3">
                        <Image
                          alt={`${symbol} logo`}
                          width={24}
                          height={24}
                          src={`https://bin.bnbstatic.com/static/assets/logos/${symbol}.png`}
                          onError={(e) =>
                            ((e.target as HTMLImageElement).src = "/default-coin.png")
                          }
                        />
                        <div>
                          <p className="text-sm font-bold">{symbol}</p>
                          <p className="text-[#989aac] text-xs text-left">{symbol}</p>
                        </div>
                      </div>
                    </td>
                    <td className="">${formatMoney(parseFloat((coin.c).toLocaleString()))}</td>
                    <td className={`hide-item ${isUp ? "text-green-400" : "text-red-400"}`}>{isUp ? "+" : ""}{change.toFixed(2)}%</td>
                    <td className="hide-item">${formatMoney(parseFloat((coin.q).toLocaleString()))}</td>
                    <td className="hide-item">
                      {chartData[chartsym] ? <Chart prices={chartData[chartsym]} /> : <p className="text-xs text-gray-500">Loading...</p>}
                    </td>
                    <td className="show-mobile text-right">
                      <p>${formatMoney(parseFloat((coin.q).toLocaleString()))}</p>
                      <p className={isUp ? "text-green-400" : "text-red-400"}>{isUp ? "+" : ""}{change.toFixed(2)}%</p>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {selectedCoin && (
          <Modal
            coin={selectedCoin}
            onClose={() => setSelectedCoin(null)}
          />
        )}
        </div>
        {/* Pagination */}
        <div className="flex justify-center mt-4 gap-2 text-sm text-white">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 tab cursor-pointer rounded disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">{currentPage} / {totalPages}</span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 tab cursor-pointer rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>  
      </div>
    </div>
  );
}
