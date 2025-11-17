#!/bin/bash

# MacOS 가상 프린터 등록 스크립트
# IP 프린터 방식을 사용하여 가상 프린터 생성

echo "MacOS 가상 프린터 설치 스크립트"
echo "=================================="

# 관리자 권한 확인
if [ "$EUID" -ne 0 ]; then
    echo "이 스크립트는 관리자 권한이 필요합니다."
    echo "sudo로 다시 실행해주세요: sudo ./install_virtual_printer.sh"
    exit 1
fi

# 가상 프린터 설정
PRINTER_NAME="VirtualPDF"
PRINTER_LOCATION="Local"
PRINTER_INFO="Virtual PDF Printer"
DEVICE_URI="socket://127.0.0.1:9100"  # 로컬호스트 가상 프린터
PPD_FILE="/System/Library/Frameworks/ApplicationServices.framework/Versions/A/Frameworks/PrintCore.framework/Versions/A/Resources/Generic.ppd"

echo "1. CUPS 설정 수정 중..."

# CUPS 설정 파일 백업
cp /etc/cups/cups-files.conf /etc/cups/cups-files.conf.backup.$(date +%Y%m%d_%H%M%S)

# FileDevice 활성화 (주석 해제)
sed -i '' 's/#FileDevice No/FileDevice Yes/' /etc/cups/cups-files.conf

echo "2. CUPS 서비스 재시작 중..."

# CUPS 서비스 재시작
launchctl stop org.cups.cupsd
sleep 2
launchctl start org.cups.cupsd
sleep 3

echo "3. 가상 프린터 등록 중..."

# 기존 프린터가 있다면 제거
lpstat -p | grep -q "$PRINTER_NAME" && lpadmin -x "$PRINTER_NAME"

# 가상 프린터 등록
lpadmin -p "$PRINTER_NAME" \
    -v "$DEVICE_URI" \
    -P "$PPD_FILE" \
    -D "$PRINTER_INFO" \
    -L "$PRINTER_LOCATION" \
    -E

if [ $? -eq 0 ]; then
    echo "✅ 가상 프린터 '$PRINTER_NAME'가 성공적으로 등록되었습니다!"

    echo "4. 프린터 정보 확인..."
    lpstat -p "$PRINTER_NAME"

    echo ""
    echo "사용 방법:"
    echo "- 인쇄할 때 '$PRINTER_NAME'를 선택하세요"
    echo "- 출력 파일은 /tmp/cups-virtual-printer/ 디렉토리에 저장됩니다"
    echo ""
    echo "프린터 제거 방법: sudo lpadmin -x $PRINTER_NAME"

    # 출력 디렉토리 생성
    mkdir -p "/tmp/cups-virtual-printer"
    chmod 777 "/tmp/cups-virtual-printer"

else
    echo "❌ 프린터 등록에 실패했습니다."
    exit 1
fi