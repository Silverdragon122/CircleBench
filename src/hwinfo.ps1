# Welcome to this script!
# you are probably viewing this becuase you don't trust the website url and thats fine!
# If you would like to run this script on your own, just supply the code shown on the website as execution parameter with this file which you download
# enjoy



param (
    [string]$code
)


Set-ExecutionPolicy -ExecutionPolicy Bypass -Scope Process -Force

try {
    
    $ramBytes = (Get-WmiObject Win32_ComputerSystem).TotalPhysicalMemory
    $ram_gb = [math]::Floor($ramBytes / 1GB)

    
    $cpu = (Get-WmiObject Win32_Processor).Name
    $threads = (Get-WmiObject Win32_Processor).NumberOfLogicalProcessors

    
    $gpu = (Get-WmiObject Win32_VideoController).Name

    
    Write-Output "RAM: $ram_gb GB"
    Write-Output "GPU: $gpu"
    Write-Output "CPU: $cpu"
    Write-Output "CPU Threads: $threads"

    
    $json = @{
        ram = "$ram_gb GB"
        gpu = $gpu
        cpu = $cpu
        threads = $threads
        code = $code
    } | ConvertTo-Json

    Invoke-RestMethod -Uri "http://localhost:2077/api/v1/link/submit" -Method Post -ContentType "application/json" -Body $json -OutFile "curl_response.txt"

    
    $responseContent = Get-Content "curl_response.txt"
    if ($responseContent -match '"status":"error"') {
    }

    Remove-Item "curl_response.txt"
} catch {
    Write-Output "An error occurred: $_"
}

Write-Output ""
Write-Output "Press any key to exit..."
Pause
