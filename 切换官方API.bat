@echo off
title 切换官方 API
echo 正在切换回开发者模式代理...
powershell -NoProfile -Command "& {$p='C:\Users\ASUS\.claude\settings.json'; $d='{\"env\":{\"ANTHROPIC_BASE_URL\":\"http://127.0.0.1:15721\",\"ANTHROPIC_AUTH_TOKEN\":\"PROXY_MANAGED\"},\"includeCoAuthoredBy\":false}'; [IO.File]::WriteAllText($p, $d, [Text.Encoding]::UTF8)}"
echo ✅ 已切换回开发者模式，重启 Claude Code 生效。
pause
