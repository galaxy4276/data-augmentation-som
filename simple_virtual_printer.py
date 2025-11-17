#!/usr/bin/env python3
"""
MacOS 가상 프린터 서버
로컬 소켓으로 프린터 데이터를 수신하고 PDF로 저장합니다.
"""

import socket
import threading
import time
import sys
import os
from datetime import datetime
import subprocess

class VirtualPrinterServer:
    def __init__(self, host='127.0.0.1', port=9100, output_dir='/tmp/cups-virtual-printer'):
        self.host = host
        self.port = port
        self.output_dir = output_dir
        self.server_socket = None
        self.running = False

        # 출력 디렉토리 생성
        os.makedirs(output_dir, exist_ok=True)

    def start(self):
        """프린터 서버 시작"""
        try:
            self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.server_socket.bind((self.host, self.port))
            self.server_socket.listen(5)
            self.running = True

            print(f"🖨️  가상 프린터 서버가 {self.host}:{self.port}에서 시작되었습니다")
            print(f"📁 출력 디렉토리: {self.output_dir}")
            print("⏹️  종료하려면 Ctrl+C를 누르세요")

            while self.running:
                try:
                    client_socket, address = self.server_socket.accept()
                    print(f"📨 {address}에서 인쇄 요청을 받았습니다")

                    # 클라이언트 처리를 별도 스레드로
                    client_thread = threading.Thread(
                        target=self.handle_client,
                        args=(client_socket, address)
                    )
                    client_thread.daemon = True
                    client_thread.start()

                except socket.error as e:
                    if self.running:
                        print(f"❌ 소켓 오류: {e}")

        except Exception as e:
            print(f"❌ 서버 시작 실패: {e}")
        finally:
            self.stop()

    def handle_client(self, client_socket, address):
        """클라이언트 인쇄 요청 처리"""
        try:
            # 데이터 수신
            data = b''
            while True:
                chunk = client_socket.recv(4096)
                if not chunk:
                    break
                data += chunk

                # 합리적인 크기 제한 (50MB)
                if len(data) > 50 * 1024 * 1024:
                    print("⚠️  데이터 크기가 너무 큽니다. 연결을 종료합니다.")
                    break

            # 데이터 저장
            if data:
                timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
                filename = f"print_job_{timestamp}.prn"
                filepath = os.path.join(self.output_dir, filename)

                with open(filepath, 'wb') as f:
                    f.write(data)

                print(f"✅ 인쇄 데이터가 저장되었습니다: {filename}")

                # PostScript/PDF 처리 시도
                self.process_print_data(filepath, data)

        except Exception as e:
            print(f"❌ 클라이언트 처리 오류: {e}")
        finally:
            client_socket.close()
            print(f"🔌 {address} 연결이 종료되었습니다")

    def process_print_data(self, filepath, data):
        """인쇄 데이터 처리 및 변환"""
        try:
            # PostScript인지 확인
            if data.startswith(b'%!PS'):
                ps_filename = filepath.replace('.prn', '.ps')
                os.rename(filepath, ps_filename)

                # Ghostscript가 있다면 PDF로 변환
                if self.check_ghostscript():
                    pdf_filename = ps_filename.replace('.ps', '.pdf')
                    cmd = [
                        'gs', '-dNOPAUSE', '-dBATCH', '-dSAFER',
                        '-sDEVICE=pdfwrite', '-sOutputFile=' + pdf_filename,
                        ps_filename
                    ]

                    try:
                        subprocess.run(cmd, check=True, capture_output=True)
                        print(f"📄 PDF로 변환되었습니다: {os.path.basename(pdf_filename)}")
                    except subprocess.CalledProcessError:
                        print("⚠️  PDF 변환에 실패했습니다 (PostScript는 저장됨)")
                else:
                    print("📄 PostScript 파일로 저장되었습니다")

            # PDF인지 확인
            elif data.startswith(b'%PDF'):
                pdf_filename = filepath.replace('.prn', '.pdf')
                os.rename(filepath, pdf_filename)
                print("📄 PDF 파일로 저장되었습니다")

            else:
                print(f"📄 원시 데이터로 저장되었습니다: {os.path.basename(filepath)}")

        except Exception as e:
            print(f"⚠️  데이터 처리 중 오류: {e}")

    def check_ghostscript(self):
        """Ghostscript 설치 확인"""
        try:
            subprocess.run(['gs', '--version'], capture_output=True, check=True)
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            return False

    def stop(self):
        """서버 종료"""
        self.running = False
        if self.server_socket:
            self.server_socket.close()
        print("🖨️  가상 프린터 서버가 종료되었습니다")

def main():
    if len(sys.argv) > 1 and sys.argv[1] in ['-h', '--help']:
        print("사용법: python3 simple_virtual_printer.py [port]")
        print("기본 포트: 9100")
        sys.exit(0)

    port = 9100
    if len(sys.argv) > 1:
        try:
            port = int(sys.argv[1])
        except ValueError:
            print("❌ 포트 번호는 숫자여야 합니다")
            sys.exit(1)

    server = VirtualPrinterServer(port=port)

    try:
        server.start()
    except KeyboardInterrupt:
        print("\n⏹️  서버를 종료합니다...")
        server.stop()

if __name__ == '__main__':
    main()