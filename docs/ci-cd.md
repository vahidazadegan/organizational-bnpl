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
3. DNS برای دامنه پایه (`BASE_DOMAIN`):

   - `admin-test.` / `panel-test.` / `app-test.`
   - `api-admin-test.` / `api-panel-test.` / `api-customer-test.` / `api-merchant-test.`

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
