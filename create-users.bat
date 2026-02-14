@echo off
cd apps\api
call npx tsx ..\..\create-users.ts
cd ..\..
pause
