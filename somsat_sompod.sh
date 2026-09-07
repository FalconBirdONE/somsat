#!/bin/bash
# ============================================================
# AI Use Case: Autonomous Satellite Communication & Data Routing
# System: SomSat (satellite) -> SomPod (ground station pod)
# ============================================================

SATELLITE_NAME="SomSat-1"
POD_NAME="SomPod-GS"

TELEMETRY_FILE="somsat_telemetry.csv"
BACKUP_FILE="sompod_backup_$(date +%Y%m%d_%H%M%S).csv"
MISSION_LOG="sompod_mission.log"

check_telemetry() {
    echo "[$POD_NAME] Checking for incoming telemetry from $SATELLITE_NAME..."
    if [ -f "$TELEMETRY_FILE" ]; then
        echo "[OK] Telemetry received: $TELEMETRY_FILE"
        return 0
    else
        echo "[ERROR] No telemetry found from $SATELLITE_NAME."
        return 1
    fi
}

count_telemetry() {
    local total
    total=$(wc -l < "$TELEMETRY_FILE")
    echo "[$POD_NAME] Records received from $SATELLITE_NAME: $total"
}

backup_telemetry() {
    cp "$TELEMETRY_FILE" "$BACKUP_FILE"
    echo "[$POD_NAME] Telemetry archived as: $BACKUP_FILE"
}

check_processes() {
    echo "[$POD_NAME] Active processes (top 5):"
    ps -ef | head -5
}

generate_mission_log() {
    {
        echo "----- Mission Log: $SATELLITE_NAME -> $POD_NAME -----"
        echo "Timestamp     : $(date)"
        echo "Telemetry file: $TELEMETRY_FILE"
        echo "Records       : $(wc -l < "$TELEMETRY_FILE")"
        echo "Backup        : $BACKUP_FILE"
        echo "-----------------------------------------------------"
    } >> "$MISSION_LOG"
    echo "[$POD_NAME] Mission log updated: $MISSION_LOG"
}

echo "===== $SATELLITE_NAME Downlink to $POD_NAME ====="

check_telemetry
if [ $? -eq 0 ]; then
    count_telemetry
    backup_telemetry
    generate_mission_log
else
    echo "[HALTED] $POD_NAME cannot proceed without telemetry data."
fi

check_processes
