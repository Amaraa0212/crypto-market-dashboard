"use client";

import { useEffect, useState } from "react";
import Table from "./components/Table";
import TokenList from "./components/TokenList";
import { Swiper, SwiperSlide , useSwiper } from 'swiper/react';
import 'swiper/css';

export interface Ticker {
  s: string;
  c: string;
  P: string;
  q: string;
}

export default function Page() {
  const swiper = useSwiper();
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [tickersAPI, setTickersAPI] = useState<Ticker[]>([]);

  useEffect(() => {
    fetch("https://api.binance.com/api/v3/ticker/24hr")
      .then(res => res.json())
      .then((data) => {
        const mapped: Ticker[] = data
          .filter((t: any) => t.symbol.endsWith("USDT"))
          .map((t: any) => ({
            s: t.symbol,
            c: t.lastPrice,
            P: t.priceChangePercent,
            q: t.volume,
          }));
        setTickersAPI(mapped);
      });
  }, []);
  

  useEffect(() => {
    const ws = new WebSocket("wss://stream.binance.com:9443/ws/!ticker@arr");

    ws.onmessage = (event) => {
      const data: any[] = JSON.parse(event.data); // any ашиглах
      const filtered = data
        .filter((coin) => coin.s.endsWith("USDT"))
        .map((coin) => ({
          s: coin.s,
          c: coin.c,
          P: coin.P,
          q: coin.q,
        }));
      setTickers(filtered);
    };

    return () => ws.close();
  }, []);

  return (
    <main className="p-8 max-w-7xl m-auto">
      <p className="font-bold text-2xl">Crypto Market Dashboard</p>
      <div className="relative">
        <Swiper
          className="gap-10 mt-10 mb-10"
          spaceBetween={50}
          slidesPerView={3.5}
          breakpoints={{
            1200: { // Desktop
              slidesPerView: 3.5,
              spaceBetween: 40,
            },
            1024: { // Tablet large
              slidesPerView: 2.7,
              spaceBetween: 35,
            },
            768: { // Tablet small
              slidesPerView: 2.3,
              spaceBetween: 30,
            },
            500: { // Mobile large
              slidesPerView: 1.5,
              spaceBetween: 25,
            },
            0: { // Mobile small
              slidesPerView: 1.1,
              spaceBetween: 20,
            },
          }}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
        >
          <SwiperSlide>
            <TokenList tickers={tickers} type="gainers" />
          </SwiperSlide>
          <SwiperSlide>
            <TokenList tickers={tickers} type="losers" />
          </SwiperSlide>
          <SwiperSlide>
            <TokenList tickers={tickers} type="new" />
          </SwiperSlide>
          <SwiperSlide>
            <TokenList tickers={tickers} type="highest" />
          </SwiperSlide>
        </Swiper>
      </div>
      <Table initialTickers={tickersAPI} />
    </main>
  );
}