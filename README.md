# Crypto Dashboard

**Төслийн товч танилцуулга:**  
Энэхүү төсөл нь крипто валютын зах зээлийн мэдээллийг харуулах вэб аппликейшн юм. Binance API болон WebSocket ашиглан бодит цагийн үнэ, өсөлт, уналт, график болон бусад статистик мэдээллийг харуулдаг.

---

## Төслийн технологи

- **Next.js 15** - React фрэймворк SSR/SSG дэмжлэгтэй
- **React 19** - UI бүрдүүлэлт
- **Tailwind CSS 4** - Хурдан, уян хатан CSS дизайн
- **Recharts** - График харуулах
- **Swiper** - Слайдер/карусель
- **WebSocket (Binance)** - Бодит цагийн зах зээлийн мэдээлэл
- **TypeScript** - Төслийн кодыг аюулгүй, тодорхой байдлаар бичих

---

## Setup / Тохиргоо

1. **Репозиторийг clone хийх**
```bash
git clone https://github.com/Amaraa0212/crypto-dashboard-next.git
cd crypto-dashboard-next
```
2. **NPM суулгах**
```
npm install
# эсвэл
yarn
```
3. **сервер ажиллуулах**
```
npm run dev
# эсвэл
yarn dev
```

## Компонентууд

1. **Table**
Крипто валютын жагсаалт
Баганууд: Symbol, Price, 24h Change, Volume, Chart
Column sort, pagination дэмжигдсэн

2. **TokenList**
Өсөлт, уналт, шинэ болон хамгийн өндөр хэмжээтэй токен жагсаалт
Chart
Бодит цагийн график
Өдөр, 7 хоног, 1 сар хугацааны шүүлтүүртэй

3. **Modal**
Тухайн токены дэлгэрэнгүй мэдээлэл
Recharts Line Chart ашигласан
Market Cap, About, Price History зэрэг мэдээлэл

## Сайжруулалт

- **State management**: React Query эсвэл Zustand ашиглан API request-ийг cache хийх

- **Pagination болон search**: Илүү оновчтой болгох

- **Dark mode**: Tailwind dark mode

- **Responsive**: Бүх төхөөрөмжид зөв харагдахуйц болгох

- **Error handling**: API алдаа болон WebSocket тасалдлыг илүү сайн барих

## Deploy

Vercel дээр байрлуулсан линк: https://crypto-dashboard-next.vercel.app