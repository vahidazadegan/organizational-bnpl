# CI/CD — محیط تست

این سند توافق و راه‌اندازی GitHub Actions + دیپلوی دستی به VPS تست را شرح می‌دهد.

## خلاصه

| مورد | مقدار |
|------|--------|
| CI | `.github/workflows/ci.yml` روی PR/`push` به `main` |
| CD | `.github/workflows/deploy-test.yml` فقط با `workflow_dispatch` |
| سرور | VPS + SSH؛ `git pull` و `docker compose build/up` روی خود سرور |
| Proxy | Caddy + HTTPS (Let’s Encrypt) |
| اسرار اپ | فایل `deploy/.env` روی سرور (نه در GitHub) |

## پیش‌نیاز VPS

1. Docker Engine + Compose plugin
2. کلون ریپو با **Deploy Key** فقط‌خواندنی (GitHub → Settings → Deploy keys)
3. مسیر کلون را به‌خاطر بسپار (مثلاً `/opt/organizational-bnpl`)
4. DNS برای دامنه پایه (`BASE_DOMAIN`):

   - `admin-test.` / `panel-test.` / `app-test.`
   - `api-admin-test.` / `api-panel-test.` / `api-customer-test.` / `api-merchant-test.`

5. کپی تنظیمات و یک‌بار هم‌تراز کردن با `main`:

```bash
cd /opt/organizational-bnpl   # همان DEPLOY_PATH
git fetch origin main && git checkout main && git pull --ff-only origin main
cp -n deploy/.env.example deploy/.env
# مقادیر را ویرایش کن
chmod +x scripts/deploy-test.sh
```

> اگر `scripts/deploy-test.sh` بعد از pull هم نبود، `DEPLOY_PATH` اشتباه است یا کلون کامل نیست.

6. کاربر SSH که Actions به آن وصل می‌شود باید بتواند `git` و `docker` را بدون پسورد اضافه اجرا کند (عضویت در گروه `docker` یا root با احتیاط).

## GitHub Secrets (فقط دیپلوی)

| Secret | توضیح |
|--------|--------|
| `SSH_HOST` | IP یا hostname سرور |
| `SSH_USER` | کاربر SSH |
| `SSH_PRIVATE_KEY` | کلید خصوصی متناظر (نه Deploy Key گیت) |
| `DEPLOY_PATH` | مسیر مطلق کلون روی سرور |

## Branch protection

روی `main`:

1. Require a pull request before merging
2. Require status checks: jobهای `Backend (Maven verify)` و `UI (...)` از workflow `CI`

(از UI گیت‌هاب: Settings → Branches → Branch protection rules)

## اجرای دیپلوی

1. تغییرات را در `main` ادغام کن و صبر کن CI سبز شود
2. Actions → **Deploy test** → Run workflow
3. Workflow ابتدا CI همان SHA را چک می‌کند؛ اگر سبز نبود fail می‌شود
4. سپس روی سرور `./scripts/deploy-test.sh` را اجرا می‌کند

## Smoke

اسکریپت بعد از `up` به این آدرس‌ها `curl` می‌زند:

- `https://api-admin-test.$BASE_DOMAIN/api/health`
- `https://api-panel-test.$BASE_DOMAIN/api/health`
- `https://api-customer-test.$BASE_DOMAIN/api/health`
- `https://api-merchant-test.$BASE_DOMAIN/api/health`

## فایل‌های مرتبط

- `deploy/docker-compose.yml`
- `deploy/Caddyfile`
- `deploy/docker/Dockerfile.backend`
- `deploy/docker/Dockerfile.ui`
- `scripts/deploy-test.sh`
