"use client";

import { Ticker } from "../page";
import Image from "next/image";

interface TokenListProps {
  tickers: Ticker[];
  type: "gainers" | "losers" | "new" | "highest";
}

export default function TokenList({ tickers, type }: TokenListProps) {
  let sorted: Ticker[] = [];

  switch (type) {
    case "gainers":
      sorted = [...tickers]
        .filter((c) => c.s.endsWith("USDT"))
        .sort((a, b) => parseFloat(b.P) - parseFloat(a.P))
        .slice(0, 3);
      break;

    case "losers":
      sorted = [...tickers]
        .filter((c) => c.s.endsWith("USDT"))
        .sort((a, b) => parseFloat(a.P) - parseFloat(b.P))
        .slice(0, 3);
      break;

    case "new":
      sorted = [...tickers].filter((c) => c.s.endsWith("USDT")).slice(-3);
      break;

    case "highest":
      sorted = [...tickers]
        .filter((c) => c.s.endsWith("USDT"))
        .sort((a, b) => parseFloat(b.c) - parseFloat(a.c))
        .slice(0, 3);
      break;
  }

  return (
    <div className="py-4 px-5 rounded-2xl [background:linear-gradient(45deg,#0f1123,theme(colors.slate.800)_50%,#0f1123)_padding-box,conic-gradient(from_var(--border-angle),theme(colors.slate.600/.48)_80%,_theme(colors.indigo.500)_86%,_theme(colors.indigo.300)_90%,_theme(colors.indigo.500)_94%,_theme(colors.slate.600/.48))_border-box] border border-transparent animate-border">
      <p className="font-bold mb-3">
        {type === "gainers"
          ? "Top Gainers"
          : type === "losers"
          ? "Top Losers"
          : type === "new"
          ? "New Coins"
          : "Highest Price"}
      </p>

      {sorted.map((coin) => {
        const change = parseFloat(coin.P);
        const isUp = change >= 0;
        const symbol = coin.s.replace("USDT", "");

        return (
          <div
            key={coin.s}
            className="flex justify-between items-center mb-4 gap-10 text-white"
          >
            <div className="flex gap-2 items-center">
              <Image
                alt={`${symbol} logo`}
                width={24}
                height={24}
                src={`https://bin.bnbstatic.com/static/assets/logos/${symbol}.png`}
                onError={(e) =>
                  ((e.target as HTMLImageElement).src = "/default-coin.png")
                }
              />
              <p className="text-sm font-bold">{symbol}</p>
            </div>
            <p className="text-sm font-bold">${Number(coin.c).toLocaleString()}</p>
            <p className={`text-sm font-bold ${isUp ? "text-green-400" : "text-red-400"}`}>
              {isUp ? "+" : ""}
              {change.toFixed(2)}%
            </p>
          </div>
        );
      })}
    </div>
  );
}
