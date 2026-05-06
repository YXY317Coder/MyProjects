@echo off
:loop
echo Starting Minecraft Bot......
node login.js

echo Exited, Error Code: %errorlevel%
echo Restart in 2 second...
timeout /t 2 /nobreak > nul

goto loop
