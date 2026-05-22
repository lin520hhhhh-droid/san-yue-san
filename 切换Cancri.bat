@echo off
title 切换 Cancri API
echo 正在切换到 Cancri API...
copy /Y "C:\Users\ASUS\.claude\settings.json" "C:\Users\ASUS\.claude\settings.json.bak" >nul 2>&1
powershell -NoProfile -Command "& {$p='C:\Users\ASUS\.claude\settings.json'; $d='{\"env\":{\"ANTHROPIC_BASE_URL\":\"https://diusqgphvybnzazgopor.supabase.co/functions/v1/api-gateway\",\"ANTHROPIC_AUTH_TOKEN\":\"cancri_sk_v1tnGSRVub8_NUHJlxYLAfPKMXAJzO-TlsUvw6XT_KUgj1J9\"},\"includeCoAuthoredBy\":false}'; [IO.File]::WriteAllText($p, $d, [Text.Encoding]::UTF8)}"
echo ✅ 已切换到 Cancri API，重启 Claude Code 生效。
pause
