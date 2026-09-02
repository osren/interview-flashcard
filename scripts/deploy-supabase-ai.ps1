# Deploy AI quota migration + Edge Functions
# Prerequisite: pnpm exec supabase login  (or set SUPABASE_ACCESS_TOKEN)

$ErrorActionPreference = "Stop"
$ProjectRef = "hrearoyfuozkcrohsome"

function Invoke-Supabase {
    param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
    & pnpm exec supabase @Args
    if ($LASTEXITCODE -ne 0) {
        throw "supabase $($Args -join ' ') failed with exit code $LASTEXITCODE"
    }
}

Write-Host "==> Checking Supabase CLI auth..." -ForegroundColor Cyan
pnpm exec supabase projects list | Out-Null

Write-Host "==> Linking project $ProjectRef..." -ForegroundColor Cyan
Invoke-Supabase link --project-ref $ProjectRef

Write-Host "==> Pushing database migrations..." -ForegroundColor Cyan
Invoke-Supabase db push

$functions = @(
    "llm-quota",
    "llm-proxy",
    "optimize-resume",
    "parse-jd"
)

foreach ($name in $functions) {
    Write-Host "==> Deploying function $name..." -ForegroundColor Cyan
    Invoke-Supabase functions deploy $name --no-verify-jwt
}

Write-Host ""
Write-Host "Done. Verify in Dashboard:" -ForegroundColor Green
Write-Host "  - Table: ai_usage_daily"
Write-Host "  - Functions: llm-quota, llm-proxy, optimize-resume, parse-jd"
Write-Host "  - Secret: SUPABASE_SERVICE_ROLE_KEY (required for quota deduction)"
