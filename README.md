# Data Augmentation using Self-Organizing Maps (SOM)

데이터 증강 애플리케이션 - Self-Organizing Maps를 활용한 데이터 증강 도구

## 개요 (Overview)

이 애플리케이션은 Self-Organizing Maps (SOM, Kohonen Network)을 사용하여 데이터를 증강하는 도구입니다. SOM은 비지도 학습 알고리즘으로, 데이터의 토폴로지를 학습하여 합성 데이터를 생성할 수 있습니다.

This application uses Self-Organizing Maps (SOM) to augment datasets. SOM is an unsupervised learning algorithm that learns data topology and can generate synthetic data points.

## 기능 (Features)

- **SOM 구현**: 완전한 Self-Organizing Map 구현
- **다양한 증강 방법**: 
  - `interpolate`: 인접 뉴런 간 보간
  - `sample_neurons`: 뉴런 샘플링 + 노이즈
  - `perturb`: 원본 데이터 변형
- **CLI 인터페이스**: 명령줄에서 쉽게 사용 가능
- **데이터 정규화**: 자동 데이터 전처리
- **통계 분석**: 원본 및 증강 데이터 통계 제공

## 설치 (Installation)

```bash
# 저장소 클론
git clone https://github.com/galaxy4276/data-augmentation-som.git
cd data-augmentation-som

# 의존성 설치
pip install -r requirements.txt
```

## 사용법 (Usage)

### 1. 기본 예제 실행

```bash
python example.py
```

### 2. CLI 사용

#### 샘플 데이터 생성 및 증강
```bash
# 기본 사용
python main.py --mode sample --samples 1000 --augment 0.5

# 증강 방법 지정
python main.py --mode sample --method perturb --augment 1.0

# SOM 그리드 크기 조정
python main.py --mode sample --grid-size 15 15 --epochs 200
```

#### 파일에서 데이터 로드 및 증강
```bash
# .npy 파일 사용
python main.py --mode file --input data.npy --augment 0.5 --output augmented.npy

# 재현 가능한 결과를 위한 시드 설정
python main.py --mode file --input data.npy --seed 42 --verbose
```

### 3. Python 코드에서 사용

```python
import numpy as np
from src import DataAugmenter
from src.utils import normalize_data

# 데이터 준비
data = np.random.randn(1000, 10)  # 1000 samples, 10 features
data_normalized, params = normalize_data(data)

# 증강기 생성 및 학습
augmenter = DataAugmenter(grid_size=(10, 10), random_state=42)
augmenter.fit(data_normalized, epochs=100, verbose=True)

# 합성 샘플 생성
synthetic = augmenter.generate_synthetic_samples(
    n_samples=500,
    method='interpolate'
)

# 또는 전체 데이터셋 증강
augmented = augmenter.augment(
    data_normalized,
    augmentation_factor=0.5,
    method='interpolate'
)
```

## 증강 방법 (Augmentation Methods)

### 1. Interpolate (보간)
인접한 뉴런 사이를 선형 보간하여 새로운 샘플을 생성합니다.
```bash
python main.py --method interpolate
```

### 2. Sample Neurons (뉴런 샘플링)
학습된 뉴런을 무작위로 선택하고 가우시안 노이즈를 추가합니다.
```bash
python main.py --method sample_neurons
```

### 3. Perturb (변형)
원본 데이터를 SOM의 이웃 정보로 변형합니다.
```bash
python main.py --method perturb
```

## 프로젝트 구조 (Project Structure)

```
data-augmentation-som/
├── README.md
├── requirements.txt
├── main.py              # CLI 애플리케이션
├── example.py           # 사용 예제
└── src/
    ├── __init__.py
    ├── som.py          # SOM 구현
    ├── augmentation.py # 데이터 증강 모듈
    └── utils.py        # 유틸리티 함수
```

## CLI 옵션 (CLI Options)

```
--mode              데이터 모드 (sample 또는 file)
--input             입력 .npy 파일 경로
--output            출력 파일 경로 (기본값: augmented_data.npy)
--samples           생성할 샘플 수 (기본값: 1000)
--augment           증강 비율 (기본값: 0.5)
--method            증강 방법 (interpolate/sample_neurons/perturb)
--grid-size         SOM 그리드 크기 (기본값: 10 10)
--epochs            학습 에포크 수 (기본값: 100)
--seed              랜덤 시드
--verbose           상세 출력
```

## 요구사항 (Requirements)

- Python 3.7+
- NumPy >= 1.21.0
- SciPy >= 1.8.0
- scikit-learn >= 1.0.1
- matplotlib >= 3.4.0
- pandas >= 1.3.0

## 라이선스 (License)

MIT License

## 기여 (Contributing)

기여는 언제나 환영합니다! Pull Request를 보내주세요.

## 참고 자료 (References)

- Kohonen, T. (1982). Self-organized formation of topologically correct feature maps.
- Kohonen, T. (2001). Self-Organizing Maps (3rd ed.). Springer.