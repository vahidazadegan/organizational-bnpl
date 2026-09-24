# CI/CD — محیط تست

این سند توافق و راه‌اندازی GitHub Actions + دیپلوی دستی به VPS تست را شرح می‌دهد.

## خلاصه

| مورد | مقدار |
|------|--------|
| CI | `.github/workflows/ci.yml` روی PR/`push` به `main` |
| CD | `.github/workflows/deploy-test.yml` فقط با `workflow_dispatch` |
| سرور | VPS + SSH؛ Actions کد را با SCP می‌فرستد، سپس Docker Compose |
| Proxy | Caddy + HTTPS (Let’s Encrypt) |
| اسرار اپ | فایل `deploy/.env` روی سرور (نه در GitHub) |

> برای دیپلوی از Actions نیازی به **Deploy Key** روی سرور نیست. فقط SSH ورود Actions به VPS کافی است.

## پیش‌نیاز VPS

1. Docker Engine + Compose plugin
2. مسیر دیپلوی (مثلاً `/opt/organizational-bnpl`) — همان `DEPLOY_PATH`؛ خالی هم باشد کافی است (Actions پرش می‌کند)
3. DNS برای دامنه پایه (`BASE_DOMAIN`)، مثلاً `bluestage.ir`:

   | نقش | هاست |
   |-----|------|
   | Admin UI | `admin.$BASE_DOMAIN` |
   | Org panel UI | `org.$BASE_DOMAIN` |
   | Customer app | `app.$BASE_DOMAIN` |
   | Admin API | `api-admin.$BASE_DOMAIN` |
   | Org panel API | `api-org.$BASE_DOMAIN` |
   | Customer API | `api-app.$BASE_DOMAIN` |
   | Merchant API | `api-merchant.$BASE_DOMAIN` |

4. یک‌بار ساخت `deploy/.env` روی سرور:

```bash
# بعد از اولین Deploy موفق (یا دستی بعد از کپی .env.example):
mkdir -p /opt/organizational-bnpl/deploy
# اگر Actions یک‌بار extract کرده:
cp /opt/organizational-bnpl/deploy/.env.example /opt/organizational-bnpl/deploy/.env
# مقادیر را ویرایش کن (JWT، دامنه، …)
```

اگر `.env` نباشد، workflow با پیام واضح fail می‌شود.

5. کاربر SSH که Actions به آن وصل می‌شود باید بتواند `docker` را بدون پسورد اضافه اجرا کند (عضویت در گروه `docker` یا root با احتیاط).

## GitHub Secrets (فقط دیپلوی)

| Secret | توضیح |
|--------|--------|
| `SSH_HOST` | IP یا hostname سرور |
| `SSH_USER` | کاربر SSH |
| `SSH_PRIVATE_KEY` | کلید خصوصی ورود Actions به VPS (محتوای کامل شامل `BEGIN/END`) |
| `DEPLOY_PATH` | مسیر مطلق روی سرور، مثلاً `/opt/organizational-bnpl` |

### نکات `SSH_PRIVATE_KEY`

- همان کلیدی که `ssh -i ... $SSH_USER@$SSH_HOST` از لپ‌تاپت کار می‌کند
- اگر passphrase دارد، یا passphrase را بردار یا در Action از `passphrase` پشتیبانی‌شده استفاده کن (پیش‌فرض بدون passphrase)
- خط آخر فایل کلید باید newline داشته باشد

## Branch protection

روی `main`:

1. Require a pull request before merging
2. Require status checks: jobهای `Backend (Maven verify)` و `UI (...)` از workflow `CI`

(از UI گیت‌هاب: Settings → Branches → Branch protection rules)

## اجرای دیپلوی

1. تغییرات را در `main` ادغام کن و صبر کن CI سبز شود
2. Actions → **Deploy test** → Run workflow
3. Workflow: چک CI → pack → SCP به VPS → extract → `SKIP_GIT_PULL=1 ./scripts/deploy-test.sh`

## Smoke

اسکریپت بعد از `up` به این آدرس‌ها `curl` می‌زند:

- `https://api-admin.$BASE_DOMAIN/api/health`
- `https://api-org.$BASE_DOMAIN/api/health`
- `https://api-app.$BASE_DOMAIN/api/health`
- `https://api-merchant.$BASE_DOMAIN/api/health`

## فایل‌های مرتبط

- `deploy/docker-compose.yml`
- `deploy/Caddyfile`
- `deploy/docker/Dockerfile.backend` (کش BuildKit: `bnpl-maven-repo-v2` + `bnpl-maven-wrapper-v2` با lock روی wrapper)
- `deploy/docker/Dockerfile.ui` (کش pnpm store با id=`bnpl-pnpm-store`)
- `scripts/deploy-test.sh`

بیلدهای بعدی روی همان VPS وابستگی‌های Maven/pnpm را دوباره از اینترنت نمی‌گیرند مگر نسخه عوض شود.
