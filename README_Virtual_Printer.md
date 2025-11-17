# MacOS 가상 프린터 설정 가이드

## 개요

MacOS 시스템에 가상 프린터를 설치하여 개발 및 테스트 환경을 구축하는 방법을 제공합니다. 가상 프린터는 실제 출력 없이 인쇄 데이터를 디지털 파일로 저장합니다.

## 파일 구성

- `install_virtual_printer.sh` - 가상 프린터 시스템 등록 스크립트
- `simple_virtual_printer.py` - 가상 프린터 서버 (파이썬)
- `test_virtual_printer.py` - 가상 프린터 테스트 스크립트
- `README_Virtual_Printer.md` - 이 설명 파일

## 설치 방법

### 1. 가상 프린터 서버 시작

```bash
# 터미널 1: 가상 프린터 서버 실행
python3 simple_virtual_printer.py
```

서버가 시작되면 다음 메시지가 표시됩니다:
```
🖨️  가상 프린터 서버가 127.0.0.1:9100에서 시작되었습니다
📁 출력 디렉토리: /tmp/cups-virtual-printer
⏹️  종료하려면 Ctrl+C를 누르세요
```

### 2. 시스템에 프린터 등록 (관리자 권한 필요)

```bash
# 터미널 2: 관리자 권한으로 프린터 등록
sudo ./install_virtual_printer.sh
```

### 3. 테스트

```bash
# 연결 및 기능 테스트
python3 test_virtual_printer.py
```

## 사용 방법

### 프린터 사용

1. 인쇄할 문서를 엽니다 (페이지, 문서, 이미지 등)
2. 파일 → 인쇄 (⌘P) 선택
3. 프린터 목록에서 "VirtualPDF" 선택
4. 인쇄 버튼 클릭

### 출력 파일 확인

```bash
# 출력 디렉토리 확인
ls -la /tmp/cups-virtual-printer/

# 최신 파일 확인
ls -lt /tmp/cups-virtual-printer/
```

출력 파일 형식:
- `print_job_YYYYMMDD_HHMMSS.pdf` - PDF 파일
- `print_job_YYYYMMDD_HHMMSS.ps` - PostScript 파일
- `print_job_YYYYMMDD_HHMMSS.prn` - 원시 인쇄 데이터

## 고급 설정

### 포트 변경

```bash
# 다른 포트로 서버 실행
python3 simple_virtual_printer.py 9101

# 다른 포트로 테스트
python3 test_virtual_printer.py 127.0.0.1 9101
```

### 출력 디렉토리 변경

Python 스크립트에서 `output_dir` 매개변수 수정:
```python
server = VirtualPrinterServer(output_dir='/custom/path/to/output')
```

### PDF 변환 최적화

Ghostscript가 설치된 경우 자동으로 PostScript를 PDF로 변환합니다:

```bash
# Homebrew로 Ghostscript 설치
brew install ghostscript
```

## 제거 방법

### 프린터 제거

```bash
# 시스템에서 프린터 제거
sudo lpadmin -x VirtualPDF

# CUPS 설정 복원 (필요시)
sudo cp /etc/cups/cups-files.conf.backup.* /etc/cups/cups-files.conf
sudo launchctl restart org.cups.cupsd
```

### 서버 중지

서버 실행 터미널에서 `Ctrl+C` 누르기

## 문제 해결

### 일반적인 문제

1. **프린터가 표시되지 않음**
   - CUPS 서비스 재시작: `sudo launchctl restart org.cups.cupsd`
   - 프린터 재설치: `sudo ./install_virtual_printer.sh`

2. **연결 거부 오류**
   - 가상 프린터 서버가 실행 중인지 확인
   - 포트 충돌 확인: `lsof -i :9100`

3. **권한 문제**
   - 출력 디렉토리 권한 확인: `ls -la /tmp/cups-virtual-printer`
   - 필요시 권한 수정: `chmod 777 /tmp/cups-virtual-printer`

### 로그 확인

```bash
# CUPS 로그 확인
tail -f /var/log/cups/error_log

# 시스템 로그 확인
log stream --predicate 'process == "cupsd"'
```

## 개발 확장

### 추가 기능 구현

1. **필터링**: 특정 애플리케이션 출력만 처리
2. **변환**: 다른 파일 형식으로 변환 (PNG, JPG 등)
3. **압축**: 출력 파일 자동 압축
4. **네트워킹**: 원격 프린터 서버로 확장

### API 통합

가상 프린터를 다른 서비스와 연동:
- 클라우드 스토리지 업로드
- 이메일 전송
- 데이터베이스 저장
- 웹 API 호출

## 라이선스

이 프로젝트는 개인 학습 및 개발 목적으로 제공됩니다.