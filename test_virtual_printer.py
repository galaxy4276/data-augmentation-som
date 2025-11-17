#!/usr/bin/env python3
"""
가상 프린터 테스트 스크립트
"""

import socket
import time
import sys

def test_printer_connection(host='127.0.0.1', port=9100):
    """프린터 연결 테스트"""
    try:
        print(f"🔗 {host}:{port}로 연결 시도 중...")
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(5)
        result = sock.connect_ex((host, port))
        sock.close()

        if result == 0:
            print("✅ 프린터 서버에 연결되었습니다!")
            return True
        else:
            print("❌ 프린터 서버에 연결할 수 없습니다.")
            return False

    except Exception as e:
        print(f"❌ 연결 오류: {e}")
        return False

def send_test_print(host='127.0.0.1', port=9100):
    """테스트 인쇄 전송"""
    try:
        print("📨 테스트 인쇄 데이터 전송 중...")

        # 간단한 PostScript 테스트 데이터
        test_ps_data = """%!PS-Adobe-3.0
%%Title: Test Print
%%Creator: Virtual Printer Test
%%BoundingBox: 0 0 612 792

/Times-Roman findfont 72 scalefont setfont
100 700 moveto
(Virtual Printer Test!) show

/Times-Roman findfont 24 scalefont setfont
100 600 moveto
(이것은 가상 프린터 테스트 출력입니다.) show

100 500 moveto
(This is a virtual printer test output.) show

showpage
%%EOF
"""

        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.connect((host, port))

        # 데이터 전송
        sock.send(test_ps_data.encode('utf-8'))
        time.sleep(1)  # 전송 완료 대기

        sock.close()
        print("✅ 테스트 인쇄 데이터가 전송되었습니다!")
        return True

    except Exception as e:
        print(f"❌ 전송 오류: {e}")
        return False

def main():
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help']:
        print("사용법: python3 test_virtual_printer.py [host] [port]")
        print("기본값: host=127.0.0.1, port=9100")
        sys.exit(0)

    host = '127.0.0.1'
    port = 9100

    if len(sys.argv) > 1:
        host = sys.argv[1]
    if len(sys.argv) > 2:
        try:
            port = int(sys.argv[2])
        except ValueError:
            print("❌ 포트 번호는 숫자여야 합니다")
            sys.exit(1)

    print("🖨️  가상 프린터 테스트")
    print("===================")

    # 연결 테스트
    if test_printer_connection(host, port):
        # 테스트 인쇄
        send_test_print(host, port)
        print("\n📁 출력 파일 확인: /tmp/cups-virtual-printer/")
    else:
        print("\n⚠️  먼저 가상 프린터 서버를 시작해주세요:")
        print("python3 simple_virtual_printer.py")

if __name__ == '__main__':
    main()