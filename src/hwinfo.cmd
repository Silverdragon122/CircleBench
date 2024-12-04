@echo off
setlocal EnableDelayedExpansion

:: Get RAM info (in GB)
for /f "skip=1 tokens=1" %%A in ('wmic computersystem get TotalPhysicalMemory') do (
    set "_ram=%%A"
    goto :got_ram
)
:got_ram
:: Convert to GB with steps to avoid 32-bit limitation
set /a "_ramMB=%_ram:~0,-6%"
set /a "ram=%_ramMB%/1024"

:: Get GPU info
for /f "delims=" %%A in ('wmic path win32_VideoController get name ^| findstr /v /r "^$" ^| findstr /v "Name"') do set "gpu=%%A"

:: Get CPU info
for /f "delims=" %%A in ('wmic cpu get name ^| findstr /v /r "^$" ^| findstr /v "Name"') do set "cpu=%%A"
for /f "delims=" %%A in ('wmic cpu get NumberOfLogicalProcessors ^| findstr /v /r "^$" ^| findstr /v "NumberOfLogicalProcessors"') do set "threads=%%A"

:: Display gathered info
echo RAM: %ram% GB
echo GPU: %gpu%
echo CPU: %cpu%
echo CPU Threads: %threads%

:: Get link code from user
set /p "code=Enter your 5-digit link code: "

:: Prepare and send HTTP request
set "json={\"ram\":\"%ram% GB\",\"gpu\":\"%gpu%\",\"cpu\":\"%cpu%\",\"threads\":\"%threads%\",\"code\":\"%code%\"}"

curl -X POST ^
     -H "Content-Type: application/json" ^
     -d "%json%" ^
     https://circlebenchmark.pythonanywhere.com/api/v1/link

echo.
echo Press any key to exit...
pause >nul