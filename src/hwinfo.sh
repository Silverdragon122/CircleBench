


if [ -z "$1" ]; then
    echo "Error: No link code provided."
    echo "Usage: ./hwinfo.sh <link_code>"
    exit 1
fi

code="$1"


if [[ "$OSTYPE" == "darwin"* ]]; then
    ram=$(sysctl -n hw.memsize | awk '{print $1/1024/1024/1024 " GB"}')
else
    ram=$(free -g | awk '/^Mem:/ {print $2}')
fi


if [[ "$OSTYPE" == "darwin"* ]]; then
    cpu=$(sysctl -n machdep.cpu.brand_string)
    threads=$(sysctl -n hw.logicalcpu)
else
    cpu=$(lscpu | grep 'Model name:' | sed 's/Model name: *//')
    threads=$(lscpu | grep '^CPU(s):' | awk '{print $2}')
fi


if [[ "$OSTYPE" == "darwin"* ]]; then
    gpu=$(system_profiler SPDisplaysDataType | grep 'Chipset Model' | awk -F: '{print $2}' | sed 's/^ *//')
else
    gpu=$(lspci | grep -i 'vga\|3d\|2d' | cut -d ':' -f3 | sed 's/^ *//')
fi


echo "RAM: $ram"
echo "GPU: $gpu"
echo "CPU: $cpu"
echo "CPU Threads: $threads"


json=$(jq -n --arg ram "$ram" --arg gpu "$gpu" --arg cpu "$cpu" --arg threads "$threads" --arg code "$code" '{ram: $ram, gpu: $gpu, cpu: $cpu, threads: $threads, code: $code}')

response=$(curl -s -X POST -H "Content-Type: application/json" -d "$json" http://localhost:2077/api/v1/link/submit)


if echo "$response" | grep -q '"status": "error"'; then
    echo "Internal script error! This script was improperly configured by the API, or the server encountered a fatal error. Try refreshing browser."
else
    echo "Data success! Go back to your browser to continue."
fi

echo
echo "Press any key to exit..."
read -n 1 -s