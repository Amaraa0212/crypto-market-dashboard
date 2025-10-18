"use client";
import { useEffect, useState } from "react";
import { Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart } from "recharts";
import { Ticker } from "../page";

interface CoinModalProps {
  coin: Ticker | null;
  onClose: () => void;
}

interface KlineData {
  name: string;
  price: number;
}

export default function Modal({ coin, onClose }: CoinModalProps) {
  const [timeframe, setTimeframe] = useState<"1d" | "1w" | "1m">("1w");
  const [data, setData] = useState<KlineData[]>([]);
  const [loading, setLoading] = useState(false);

  const change = coin ? parseFloat(coin.P) : 0;
  const isUp = change >= 0;

  useEffect(() => {
    if (!coin) return;
  
    const fetchKlines = async () => {
      try {
        setLoading(true);
  
        let interval = "1d";
        let limit = 7;
  
        if (timeframe === "1d") {
          interval = "1h";
          limit = 24;
        } else if (timeframe === "1w") {
          interval = "1d";
          limit = 7;
        } else if (timeframe === "1m") {
          interval = "1d";
          limit = 30;
        }
  
        const symbol = coin.s.toUpperCase();
        if (!symbol.endsWith("USDT")) return;
  
        const res = await fetch(
          `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
        );
        const json = await res.json();
  
        if (!Array.isArray(json)) {
          console.warn("Invalid response for symbol:", symbol, json);
          return;
        }
  
        const formatted = json.map((c: any) => {
          const date = new Date(c[0]);
          let name = "";
  
          if (timeframe === "1d") {
            name = date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          } else if (timeframe === "1w") {
            name = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          } else if (timeframe === "1m") {
            name = date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }
  
          return {
            name,
            price: parseFloat(c[4]),
          };
        });
  
        setData(formatted);
      } catch (err) {
        console.error("Failed to load chart:", err);
      } finally {
        setLoading(false);
      }
    };
  
    fetchKlines();
  }, [coin?.s, timeframe]);  

  if (!coin) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-10">
      <div className="bg-[#0f1123] p-6 rounded-2xl [background:linear-gradient(45deg,#0f1123,theme(colors.slate.800)_50%,#0f1123)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] border border-transparent animate-border w-full max-w-lg relative text-white">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-5 tab text-gray-300 hover:text-white"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex justify-between mt-8 items-center mb-4">
          <div>
            <h2 className="text-2xl font-bold">{coin.s.replace("USDT", "")}</h2>
            <p className={`text-sm ${isUp ? "text-green-400" : "text-red-400"}`}>
              {isUp ? "+" : ""}
              {change.toFixed(2)}%
            </p>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">${Number(coin.c).toLocaleString()}</p>
            <p className="text-xs text-gray-400">Vol: {Number(coin.q).toLocaleString()}</p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex justify-between items-center gap-3 mb-4">
          <div className="text-sm font-bold">USD</div>
          <div className="gap-3 flex">
            {[
                { label: "1D", value: "1d" },
                { label: "1W", value: "1w" },
                { label: "1M", value: "1m" },
            ].map(({ label, value }) => (
                <button
                key={value}
                onClick={() => setTimeframe(value as any)}
                className={`px-3 py-1 tab rounded-full text-sm ${
                    timeframe === value
                    ? "active"
                    : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                }`}
                >
                {label}
                </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-60">
          {loading ? (
            <p className="text-center text-gray-400 mt-8">Loading chart...</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2a2d4a" />
                <XAxis dataKey="name" stroke="#8884d8" tick={{ fontSize: 10 }} />
                <YAxis stroke="#8884d8" domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1c2e",
                    border: "none",
                    color: "#fff",
                  }}
                />
                <Area
                  type="bumpX"
                  dataKey="price"
                  stroke={isUp ? "#22c55e" : "#ef4444"}
                  dot={false}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
