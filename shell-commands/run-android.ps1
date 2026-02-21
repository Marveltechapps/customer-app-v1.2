# Run Android App (Windows PowerShell)
# This script sets up the Android SDK paths and runs the React Native Android app

# Navigate to project root (parent of shell-commands)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Join-Path $scriptPath "..")

# Set Android SDK paths (Windows)
if ($env:ANDROID_HOME) {
    $androidHome = $env:ANDROID_HOME
} else {
    # Default Windows Android SDK location
    $androidHome = "$env:LOCALAPPDATA\Android\Sdk"
    if (-not (Test-Path $androidHome)) {
        $androidHome = "$env:USERPROFILE\AppData\Local\Android\Sdk"
    }
}

if (Test-Path $androidHome) {
    $env:ANDROID_HOME = $androidHome
    $env:PATH = "$env:PATH;$androidHome\platform-tools;$androidHome\emulator"
    Write-Host "✅ Android SDK found at: $androidHome" -ForegroundColor Green
} else {
    Write-Host "⚠️  Android SDK not found. Please set ANDROID_HOME environment variable." -ForegroundColor Yellow
}

# Check if emulator is running or device is connected
Write-Host "🔍 Checking for connected devices/emulators..." -ForegroundColor Cyan

try {
    $adbOutput = & adb devices 2>&1
    $deviceLines = $adbOutput | Where-Object { $_ -match "device$" -and $_ -notmatch "List of devices" }
    $deviceCount = ($deviceLines | Measure-Object).Count
    
    if ($deviceCount -eq 0) {
        Write-Host "⚠️  No devices or emulators found!" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Available emulators:" -ForegroundColor Cyan
        try {
            $avds = & emulator -list-avds 2>&1
            if ($avds) {
                Write-Host $avds
            } else {
                Write-Host "No emulators found"
            }
        } catch {
            Write-Host "No emulators found"
        }
        Write-Host ""
        $response = Read-Host 'Would you like to start an emulator? (y/n)'
        if ($response -match "^[yY]([eE][sS])?$") {
            Write-Host "Starting emulator..." -ForegroundColor Cyan
            $avdName = Read-Host 'Enter emulator name (or press Enter for Medium_Phone)'
            if ([string]::IsNullOrWhiteSpace($avdName)) {
                $avdName = "Medium_Phone"
            }
            Start-Process -FilePath "emulator" -ArgumentList "-avd", $avdName -NoNewWindow
            Write-Host "⏳ Waiting for emulator to boot..." -ForegroundColor Cyan
            & adb wait-for-device
            Write-Host "✅ Emulator is ready!" -ForegroundColor Green
        } else {
            Write-Host "Please start an emulator manually or connect a device, then run this script again." -ForegroundColor Yellow
            exit 1
        }
    } else {
        Write-Host "✅ Found $deviceCount device(s) connected" -ForegroundColor Green
        & adb devices
    }
} catch {
    Write-Host "⚠️  Error checking devices. Make sure ADB is in your PATH." -ForegroundColor Yellow
    Write-Host "Error: $_" -ForegroundColor Red
}

# Kill any existing Metro bundler on port 8081
Write-Host ""
Write-Host "🔍 Checking for existing Metro bundler on port 8081..." -ForegroundColor Cyan
try {
    $connections = Get-NetTCPConnection -LocalPort 8081 -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($pid in $processIds) {
            $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
            if ($process) {
                Write-Host "🛑 Stopping existing Metro bundler (PID: $pid)..." -ForegroundColor Yellow
                Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 1
    }
} catch {
    # If Get-NetTCPConnection fails, try alternative method
    try {
        $netstatOutput = netstat -ano | Select-String ":8081"
        if ($netstatOutput) {
            $pids = $netstatOutput | ForEach-Object {
                if ($_ -match '\s+(\d+)$') {
                    $matches[1]
                }
            } | Select-Object -Unique
            
            foreach ($pid in $pids) {
                Write-Host "🛑 Stopping existing Metro bundler (PID: $pid)..." -ForegroundColor Yellow
                taskkill /F /PID $pid 2>$null
            }
            Start-Sleep -Seconds 1
        }
    } catch {
        # Ignore errors if port is not in use
    }
}

Write-Host ""
Write-Host "🚀 Starting React Native app..." -ForegroundColor Green
npm run android

