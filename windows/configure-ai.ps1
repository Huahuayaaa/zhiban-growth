$ErrorActionPreference = 'Stop'
$projectDir = Split-Path -Parent $PSScriptRoot
Write-Host '更换 DeepSeek API 密钥。留空回车保留现有配置。'
$keyInput = Read-Host 'API Key（输入内容不会显示）' -AsSecureString
if ($keyInput.Length -eq 0) { Write-Host '保留现有配置。'; exit 0 }
$memory = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($keyInput)
try {
    $apiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($memory).Trim()
    if ($apiKey -notmatch '^sk-[A-Za-z0-9_-]{16,}$') { throw '密钥格式不正确，现有配置未修改。' }
    $configDir = Join-Path $projectDir 'config'
    New-Item -ItemType Directory -Force -Path $configDir | Out-Null
    $settings = "DEEPSEEK_API_KEY=$apiKey`nDEEPSEEK_BASE_URL=https://api.deepseek.com`nDEEPSEEK_MODEL=deepseek-flash`n"
    [IO.File]::WriteAllText((Join-Path $configDir 'ai.env'), $settings, (New-Object Text.UTF8Encoding($false)))
    Write-Host '配置已保存。重启网站后生效。'
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($memory)
    $apiKey = $null
    $settings = $null
}
