# Tech India Tender — Full Website Setup (ગુજરાતીમાં)

## 1. જરૂરી સોફ્ટવેર
- Node.js 18+ : https://nodejs.org
- PostgreSQL 14+ : https://www.postgresql.org/download/
- VS Code (optional)

## 2. Project ખોલો
```bash
cd tech-india-tender-fullstack
npm install
```

## 3. Database બનાવો
PostgreSQL માં login કરીને:
```sql
CREATE DATABASE techindiatender;
```
પછી:
```bash
psql -U postgres -d techindiatender -f database/schema.sql
psql -U postgres -d techindiatender -f database/seed.sql
```

## 4. .env ફાઇલ બનાવો
`.env.example` ને copy કરીને `.env` નામ આપો. તેમાં database password, JWT_SECRET, SMTP details નાખો.

## 5. Website ચલાવો
```bash
npm run dev
```
પછી ખોલો: http://localhost:5000

## 6. Admin Login
Seed માં admin account છે:
- Email: admin@techindiatender.com
- Password: Admin@12345

પહેલી login પછી password બદલી લેજો.

## 7. OTP કેવી રીતે કામ કરે છે
- Customer register/login કરે ત્યારે OTP બને છે.
- OTP registered email પર જાય છે.
- SMS provider configure કરેલો હોય તો registered mobile પર પણ જાય છે.
- WhatsApp Cloud API configure કરેલું હોય તો WhatsApp પર પણ OTP જઈ શકે.

## 8. Keyword Tender Alert
Customer dashboard માં keyword ઉમેરશો — દા.ત. “furniture”, “computer”, “safety”.
Admin નવું tender add કરશે અને title/organisation/category/state માં એ keyword હશે, તો customer ને:
- Email alert
- WhatsApp alert
- SMS alert (જો SMS provider configured હોય)
મળશે.

## 9. Payment Gateway
`.env` માં Razorpay Key ID અને Secret નાખ્યા પછી subscription/payment activate થશે.

## 10. Security
- Password bcrypt થી hash થાય છે
- Login પછી JWT token
- OTP expiry 10 મિનિટ
- Helmet, CORS, rate limiting
- Role-based admin protection
- Audit logs table
