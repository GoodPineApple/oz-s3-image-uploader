# React S3 Uploader

Vite 기반 React 애플리케이션으로 AWS S3를 사용하여 이미지를 업로드하고 관리할 수 있는 웹 애플리케이션입니다.

## 기능

- 🖼️ 이미지 파일 드래그 앤 드롭 업로드
- 📁 파일 선택을 통한 이미지 업로드
- 📊 실시간 업로드 진행률 표시
- 🖼️ 업로드된 이미지 갤러리 뷰
- 🗑️ 이미지 삭제 기능
- 📱 반응형 디자인

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`env.example` 파일을 복사하여 `.env` 파일을 생성하고 AWS S3 설정을 입력하세요:

```bash
cp env.example .env
```

`.env` 파일에 다음 정보를 입력하세요:

```env
VITE_AWS_ACCESS_KEY_ID=your_access_key_here
VITE_AWS_SECRET_ACCESS_KEY=your_secret_key_here
VITE_AWS_REGION=ap-northeast-2
VITE_S3_BUCKET_NAME=your_bucket_name_here
```

### 3. 개발 서버 실행

```bash
npm run dev
```

### 4. 프로덕션 빌드

```bash
npm run build
```

## AWS S3 설정

### 1. S3 버킷 생성

1. AWS 콘솔에서 S3 서비스로 이동
2. "버킷 만들기" 클릭
3. 버킷 이름 입력 (전 세계적으로 고유해야 함)
4. 리전 선택 (권장: ap-northeast-2)
5. 퍼블릭 액세스 차단 설정을 "모든 퍼블릭 액세스 차단 해제"로 설정
6. 버킷 생성

### 2. CORS 설정

S3 버킷의 권한 탭에서 CORS 설정을 추가하세요:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "PUT", "POST", "DELETE"],
        "AllowedOrigins": ["*"],
        "ExposeHeaders": []
    }
]
```

### 3. 버킷 정책 설정

버킷 정책을 다음과 같이 설정하세요:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::your-bucket-name/*"
        }
    ]
}
```

### 4. IAM 사용자 생성

1. AWS IAM 콘솔에서 새 사용자 생성
2. 프로그래밍 방식 액세스 선택
3. 다음 정책을 연결:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:PutObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket-name",
                "arn:aws:s3:::your-bucket-name/*"
            ]
        }
    ]
}
```

## 프로젝트 구조

```
react-s3-uploader/
├── public/
├── src/
│   ├── App.jsx          # 메인 애플리케이션 컴포넌트
│   ├── App.css          # 스타일시트
│   ├── main.jsx         # 애플리케이션 진입점
│   ├── index.css        # 글로벌 스타일
│   └── s3Service.js     # AWS S3 서비스 함수들
├── index.html
├── package.json
├── vite.config.js
├── env.example          # 환경 변수 예시
└── README.md
```

## 사용법

1. 웹 애플리케이션에 접속
2. 이미지 파일을 드래그 앤 드롭하거나 "파일 선택" 버튼 클릭
3. 업로드 진행률을 확인
4. 업로드된 이미지를 갤러리에서 확인
5. 필요시 이미지 삭제

## 기술 스택

- **React 18** - UI 라이브러리
- **Vite** - 빌드 도구
- **AWS SDK** - S3 연동
- **CSS3** - 스타일링

## 라이선스

MIT License
