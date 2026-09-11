$ErrorActionPreference = 'Stop'
$skip = @('PORT')
$plaintext = @(
  'NODE_ENV',
  'VITE_API_BASE_URL',
  'FRONTEND_URL',
  'QWEN_BASE_URL',
  'QWEN_MODEL',
  'SARVAM_BASE_URL',
  'SARVAM_STT_MODEL',
  'SARVAM_TTS_MODEL',
  'SMS_PROVIDER',
  'TWO_FACTOR_BASE_URL',
  'TWO_FACTOR_TEMPLATE_NAME',
  'JWT_EXPIRES_IN'
)

function Import-DotEnv($path) {
  Get-Content -LiteralPath $path | ForEach-Object {
    $line = $_.Trim()
    if ($line -eq '' -or $line.StartsWith('#')) { return }
    $idx = $line.IndexOf('=')
    if ($idx -lt 1) { return }
    $key = $line.Substring(0, $idx).Trim()
    $val = $line.Substring($idx + 1)
    if (($val.StartsWith('"') -and $val.EndsWith('"')) -or ($val.StartsWith("'") -and $val.EndsWith("'"))) {
      $val = $val.Substring(1, $val.Length - 2)
    }
    [pscustomobject]@{ Key = $key; Value = $val }
  }
}

$vars = @{}
if (Test-Path -LiteralPath '.env') { Import-DotEnv '.env' | ForEach-Object { $vars[$_.Key] = $_.Value } }
if (Test-Path -LiteralPath 'backend\.env') { Import-DotEnv 'backend\.env' | ForEach-Object { $vars[$_.Key] = $_.Value } }
$vars['NODE_ENV'] = 'production'
$vars['VITE_API_BASE_URL'] = '/api'

$ok = 0
$fail = @()
foreach ($k in @($vars.Keys)) {
  if ($skip -contains $k) { continue }
  if ([string]::IsNullOrWhiteSpace($vars[$k])) {
    Write-Host "Skip empty $k"
    continue
  }
  Write-Host "Setting $k"
  $tmp = Join-Path $env:TEMP ("medikiosk-vercel-" + $k + ".txt")
  [System.IO.File]::WriteAllText($tmp, $vars[$k])
  $flag = if ($plaintext -contains $k) { '--no-sensitive' } else { '--sensitive' }
  cmd /c "npx --yes vercel env add $k production,preview --yes --force $flag < `"$tmp`""
  $code = $LASTEXITCODE
  Remove-Item -LiteralPath $tmp -Force -ErrorAction SilentlyContinue
  if ($code -eq 0) { $ok++ } else { $fail += $k }
}

Write-Host "Added $ok variables"
if ($fail.Count) { Write-Host "Failed: $($fail -join ', ')"; exit 1 }
