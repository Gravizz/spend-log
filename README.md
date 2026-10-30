# Spend Log

เผยแพร่ภายใต้ [MIT License](LICENSE) — ใช้งาน แก้ไข และนำไปใช้เชิงพาณิชย์ได้ โดยต้องเก็บข้อความลิขสิทธิ์และ license ไว้เมื่อแจกจ่าย

เว็บบันทึกรายรับรายจ่ายส่วนตัว หน้าจอภาษาไทย ใช้งานได้ทั้งมือถือและคอมพิวเตอร์ เก็บข้อมูลใน SQLite บนเครื่องที่ deploy เหมาะกับการใช้งานคนเดียวหรือบัญชีที่ใช้ร่วมกัน

## ทำอะไรได้บ้าง

- เพิ่ม แก้ไข และลบรายการรายรับรายจ่าย พร้อมวันที่ หมวด และโน้ต
- จัดการหมวดรายรับและรายจ่าย
- ดูรายการและยอดรวมรายเดือน พร้อมรายรับ รายจ่าย และยอดสุทธิ
- ดูสรุปรายปีและยอดแยกตามเดือน
- ล็อกอินด้วยบัญชีที่เจ้าของระบบกำหนดใน environment
- จำกัดการล็อกอินผิด 5 ครั้งต่อ IP ในช่วง 15 นาที

แอปใช้ **SvelteKit 3, Svelte 5, Tailwind CSS 4 และ SQLite** โดยเก็บจำนวนเงินเป็นจำนวนเต็มหน่วยสตางค์ ไม่ต้องติดตั้ง PostgreSQL, Redis หรือบริการฐานข้อมูลภายนอก

ปัจจุบันมีบัญชีเดียวจาก `AUTH_USER` / `AUTH_PASSWORD` ยังไม่มีระบบสมัครสมาชิกหรือแยกข้อมูลหลายผู้ใช้

## สิ่งที่ต้องมี

| เครื่องมือ | ใช้ทำอะไร |
| --- | --- |
| Node.js 24 ขึ้นไป | รันแอปจริงและ build ด้วย npm; ใช้ SQLite ที่มากับ Node |
| npm | ติดตั้ง dependency จาก `package-lock.json` |
| Bun 1.4.4 ขึ้นไป | รันเทสต์ และใช้พัฒนา/build แทน npm ได้ |
| Git | ดาวน์โหลดโค้ดและอัปเดตเวอร์ชัน |

ต้อง deploy เป็นแอปที่รันฝั่งเซิร์ฟเวอร์และมีพื้นที่เก็บข้อมูลถาวร การอัปโหลดเฉพาะไฟล์ static ใช้งานไม่ได้

คำสั่งด้านล่างใช้ shell ของ Linux, macOS หรือ Termux บน Windows ให้ปรับคำสั่งคัดลอกไฟล์และ environment ให้ตรงกับ PowerShell

## เริ่มใช้งานบนเครื่องตัวเอง

```sh
git clone https://github.com/Gravizz/spend-log.git
cd spend-log
bun install --frozen-lockfile
cp .env.example .env
```

แก้ `.env` ให้ครบ 3 ค่าก่อนรัน:

```dotenv
AUTH_USER=your-username
AUTH_PASSWORD="replace-with-a-long-unique-password"
SESSION_SECRET=replace-with-a-random-secret
```

สร้างค่า `SESSION_SECRET` แล้วนำผลลัพธ์ไปใส่ในไฟล์:

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

ห้ามใช้ค่าตัวอย่างเป็นรหัสผ่านหรือ secret จริง และอย่า commit `.env` เข้า Git

```sh
bun run dev
```

เปิด URL ที่แสดงใน terminal แล้วล็อกอินด้วยบัญชีจาก `.env` จากนั้นสร้างหมวดก่อนเพิ่มรายการแรก ฐานข้อมูลจะถูกสร้างให้อัตโนมัติเมื่อแอปเปิดใช้งานส่วนข้อมูล

### ตรวจสอบก่อนส่งโค้ด

```sh
bun test
bun run check
bun run build
```

## Environment variables

| ชื่อ | ค่าเริ่มต้น / ความหมาย |
| --- | --- |
| `AUTH_USER` | จำเป็น: ชื่อผู้ใช้สำหรับล็อกอิน |
| `AUTH_PASSWORD` | จำเป็น: รหัสผ่านสำหรับล็อกอิน |
| `SESSION_SECRET` | จำเป็น: secret สำหรับลงลายเซ็น session |
| `DATABASE_PATH` | `data/spend.db`; แนะนำ absolute path นอกโฟลเดอร์ release ใน production |
| `HOST` | ที่อยู่ที่เซิร์ฟเวอร์รับการเชื่อมต่อ; ใช้ `127.0.0.1` เมื่อ proxy อยู่เครื่องเดียวกัน |
| `PORT` | `3000`; พอร์ตของแอป |
| `REQUIRE_HTTPS` | ตั้ง `true` เพื่อเปลี่ยนคำขอ HTTP ไป HTTPS |
| `PROTOCOL_HEADER` | เช่น `x-forwarded-proto` เมื่ออยู่หลัง proxy ที่เชื่อถือได้ |
| `ADDRESS_HEADER` | header ที่ใช้หา IP ผู้ใช้ เช่น `cf-connecting-ip` หรือ `x-forwarded-for` |
| `XFF_DEPTH` | `1`; จำนวน proxy ที่เชื่อถือได้ เมื่อใช้ `ADDRESS_HEADER=x-forwarded-for` |
| `TZ` | แนะนำ `Asia/Bangkok` สำหรับการใช้งานในประเทศไทย |

ไฟล์ `.env` ไม่ขยาย `$HOME` หรือ `~` ให้เอง สำหรับ path ให้ใส่ตำแหน่งจริง เช่น `/home/app/spend-log-data/spend.db`

## Deploy บนเซิร์ฟเวอร์ทั่วไป

### 1. เตรียมโค้ดและ configuration

ติดตั้ง Node.js 24 ขึ้นไป แล้ว clone repository หรือ fork ของคุณ:

```sh
git clone https://github.com/Gravizz/spend-log.git
cd spend-log
npm ci --include=dev --ignore-scripts --no-audit --no-fund
cp .env.example .env
chmod 600 .env
```

ใส่ข้อมูลล็อกอินและ secret ของคุณใน `.env` พร้อมตั้งค่าต่อไปนี้ตามเครื่องจริง:

```dotenv
NODE_ENV=production
HOST=127.0.0.1
PORT=3000
TZ=Asia/Bangkok
DATABASE_PATH=/home/app/spend-log-data/spend.db
```

เลือก `DATABASE_PATH` ที่ผู้ใช้ซึ่งรันแอปมีสิทธิ์เขียน โฟลเดอร์แม่จะถูกสร้างให้ หากใช้ container ให้ mount ตำแหน่งนี้เป็น persistent volume

### 2. Build และเริ่มแอป

```sh
node --env-file=.env node_modules/vite/bin/vite.js build
npm start
```

คำสั่ง build นี้โหลด `.env` เข้า Node ด้วย เพราะการวิเคราะห์ route ระหว่าง build ต้องมีค่า auth configuration ส่วน `npm start` โหลด `.env` ให้แล้ว

`npm start` รันใน foreground สำหรับใช้งานต่อเนื่องให้ใช้ process manager เช่น systemd หรือระบบจัดการ process ของ hosting เพื่อให้แอปเริ่มใหม่เมื่อ process หยุด

### 3. ผูกโดเมนและ HTTPS

ตั้ง reverse proxy เช่น Nginx, Caddy หรือ Cloudflare Tunnel ให้ส่งคำขอจากโดเมนของคุณไป `http://127.0.0.1:3000` โดยคง hostname เดิมและส่ง protocol ของผู้ใช้ผ่าน `X-Forwarded-Proto`

เมื่อ proxy พร้อมแล้ว เพิ่มใน `.env` และ restart แอป:

```dotenv
REQUIRE_HTTPS=true
PROTOCOL_HEADER=x-forwarded-proto
```

สำหรับ Cloudflare Tunnel ใช้:

```dotenv
ADDRESS_HEADER=cf-connecting-ip
```

สำหรับ reverse proxy ที่เชื่อถือได้หนึ่งชั้นและใช้ `X-Forwarded-For` ใช้:

```dotenv
ADDRESS_HEADER=x-forwarded-for
XFF_DEPTH=1
```

เปิดใช้ header เหล่านี้เมื่อเข้าถึงพอร์ตแอปได้ผ่าน proxy ที่กำหนดเท่านั้น และให้ proxy เขียน header ใหม่หรือเติม IP จริงอย่างถูกต้อง การเปิดพอร์ตแอปให้บุคคลทั่วไปเข้าตรง ๆ อาจทำให้ปลอม IP เพื่อหลบ rate limit ได้

ถ้าไม่กำหนด `ADDRESS_HEADER` หลัง proxy แอปอาจเห็นทุกคนเป็น IP ของ proxy เดียวกัน อย่าตั้ง `REQUIRE_HTTPS=true` ก่อนกำหนด protocol ให้ถูกต้อง เพราะอาจเกิด redirect loop

ให้ proxy ส่งคำขอเข้าแอป อย่าตั้ง document root เป็นโฟลเดอร์โปรเจกต์ทั้งก้อนหรือเปิดให้ดาวน์โหลด `.env`, `.git` และฐานข้อมูล

### 4. อัปเดตเวอร์ชัน

แนะนำให้ build ในโฟลเดอร์ release ใหม่ก่อน แล้วจึงสลับไปใช้ release นั้นและ restart แอป โดยเก็บ `.env` และฐานข้อมูลไว้นอก release

ถ้าใช้ checkout เดิม ให้หยุดแอปก่อน `git pull --ff-only`, ติดตั้ง dependency และ build ใหม่ด้วยคำสั่งข้างต้น แล้วจึงเริ่มแอปอีกครั้ง อย่าลบฐานข้อมูลระหว่างอัปเดต

## Deploy บน Android / Termux

repository มีสคริปต์สำหรับรันแอปบน Termux ผ่าน Cloudflare Tunnel และอัปเดตจาก `main` อัตโนมัติโดยไม่ใช้ GitHub Actions

### เตรียมเครื่องและ build ครั้งแรก

```sh
pkg install git nodejs cloudflared termux-services
node --version
git clone https://github.com/Gravizz/spend-log.git "$HOME/spend-log-src"
cd "$HOME/spend-log-src"
npm ci --include=dev --ignore-scripts --no-audit --no-fund
AUTH_USER=build-only AUTH_PASSWORD=build-only SESSION_SECRET=build-only npm run build

mkdir -p "$HOME/spend-log/releases/initial" "$HOME/spend-log/data" "$HOME/.config/spend-log"
cp -R build package.json "$HOME/spend-log/releases/initial/"
cp .env.example "$HOME/spend-log/.env"
chmod 600 "$HOME/spend-log/.env"
ln -s releases/initial "$HOME/spend-log/current"
```

ตรวจว่า Node เป็นเวอร์ชัน 24 ขึ้นไป และใส่บัญชีล็อกอินกับ secret จริงใน `~/spend-log/.env` ขั้นตอนนี้สำหรับติดตั้งครั้งแรกเท่านั้น หากมีระบบเดิมอยู่แล้ว อย่าคัดลอก `.env.example` ทับ `.env` เดิม

### ตั้ง Cloudflare Tunnel และ service

1. เพิ่มโดเมนของคุณใน Cloudflare และสร้าง tunnel สำหรับเครื่องนี้
2. เก็บ **เฉพาะ token** ของ tunnel ใน `~/.config/spend-log/tunnel-token` แล้วใช้ `chmod 600` กับไฟล์นี้ อย่าใส่คำสั่ง `cloudflared service install` ลงไปด้วย
3. เพิ่ม Published application ใน tunnel: hostname เป็นโดเมนของคุณ และ service URL เป็น `http://127.0.0.1:3100`
4. เปิด Termux session ใหม่หลังติดตั้ง `termux-services` เพื่อให้ service daemon เริ่มทำงาน แล้วรัน:

```sh
cd "$HOME/spend-log-src"
sh deploy/redmagic-setup.sh
```

สคริปต์ใช้พอร์ต `3100`, รับเฉพาะ loopback, ตั้ง timezone กรุงเทพฯ และเก็บฐานข้อมูลใน `~/spend-log/data/spend.db` ชื่อ `redmagic` เป็นชื่อเครื่องที่ใช้พัฒนาสคริปต์ ไม่ได้จำกัดยี่ห้อมือถือ

### Auto-deploy เมื่อ push main

สำหรับการ deploy โค้ดของคุณเอง ให้ fork repository และเปลี่ยน URL เริ่มต้นในตัวแปร `repository` ของ `deploy/redmagic-auto-deploy.sh` ให้เป็น **public repository ของคุณ** ก่อนติดตั้ง สคริปต์เดิมชี้ไป `Gravizz/spend-log` ส่วนชื่อ host ใน health check สามารถเปลี่ยนเป็นโดเมนของคุณได้

```sh
cd "$HOME/spend-log-src"
sh deploy/redmagic-auto-deploy-setup.sh
```

หลังจากนั้น push เข้า `main` ของ repository ที่ตั้งไว้ได้ตามปกติ เครื่องจะตรวจทุก 60 วินาที แล้วติดตั้ง dependency, build และเปลี่ยน release เมื่อผ่าน health check หาก build ล้มเหลวจะคง release เดิม หากเริ่มแอปใหม่ไม่ผ่านจะย้อนกลับ และลองอีกครั้งหลัง 60 วินาที แต่ละรอบมี timeout 10 นาที

ตัวอัปเดตไม่รัน Bun tests ให้รันเทสต์และ typecheck บนเครื่องพัฒนาก่อน push ฐานข้อมูลกับ `.env` ไม่ถูกคัดลอกหรือแทนที่ระหว่าง auto-deploy

```sh
# ดูสถานะและ log
sv status "$PREFIX/var/service/spend-auto-deploy"
tail -n 30 "$HOME/spend-log/logs/deploy/current"
cat "$HOME/spend-log/current/REVISION"

# หยุด / เปิด auto-deploy
sv down "$PREFIX/var/service/spend-auto-deploy"
sv up "$PREFIX/var/service/spend-auto-deploy"
```

Android อาจปิด Termux เมื่อประหยัดแบตเตอรี่ ให้ตั้งยกเว้นตามอุปกรณ์ หลังรีบูตให้เปิด Termux และรัน `termux-wake-lock` การเริ่มอัตโนมัติก่อนเปิด Termux ยังไม่ได้ตั้งไว้ในสคริปต์

รายละเอียดโครงสร้าง release, service และการดูแลเครื่องเดิมอยู่ใน [deploy/redmagic.md](deploy/redmagic.md)

## ข้อมูลและข้อจำกัดที่ควรรู้

- การติดตั้งใหม่เริ่มด้วยฐานข้อมูลว่าง ไม่มีข้อมูลตัวอย่างหรือรหัสผ่านเริ่มต้น
- SQLite ใช้ WAL ให้สำรองด้วย SQLite backup API หรือหยุดแอปให้เรียบร้อยก่อนคัดลอกไฟล์ การคัดลอกเฉพาะ `spend.db` ขณะแอปกำลังทำงานอาจไม่รวมข้อมูลล่าสุด
- เก็บ backup ไว้อีกเครื่องหนึ่ง และสำรอง `.env` แยกอย่างปลอดภัย
- session มีอายุ 30 วัน การ logout ลบ cookie ใน browser แต่ไม่เพิกถอนสำเนาที่ถูกคัดลอกไปแล้ว หากต้องการยกเลิก session ทั้งหมดให้เปลี่ยน `SESSION_SECRET` และ restart
- rate limit อยู่ในหน่วยความจำ รีเซ็ตเมื่อ restart และแยกกันในแต่ละ process จึงเหมาะกับการรันแอป instance เดียวตามรูปแบบนี้
- build และสคริปต์ deploy ไม่ได้ย้ายหรือแปลง schema ของฐานข้อมูลเก่าให้อัตโนมัติ หากแก้ schema ในอนาคตต้องเตรียม migration และ backup ก่อนอัปเดต
