import React, { useState, useEffect, useRef } from 'react';
import { uploadToS3, listS3Files, deleteFromS3 } from './s3Service';
import './App.css';

function App() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  // 컴포넌트 마운트 시 기존 이미지 목록 로드
  useEffect(() => {
    console.log('🚀 [APP] 컴포넌트 마운트됨, 이미지 목록 로드 시작');
    loadImages();
  }, []);

  const loadImages = async () => {
    console.log('📋 [APP] 이미지 목록 로드 시작');
    setLoading(true);
    const result = await listS3Files();
    if (result.success) {
      console.log('✅ [APP] 이미지 목록 로드 성공:', result.files.length, '개');
      setImages(result.files);
    } else {
      console.error('❌ [APP] 이미지 로드 실패:', result.error);
      setMessage(`이미지 로드 실패: ${result.error}`);
    }
    setLoading(false);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    console.log('📁 [APP] 파일 선택됨:', files.length, '개 파일');
    files.forEach(uploadFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    console.log('🎯 [APP] 파일 드롭됨:', files.length, '개 파일');
    files.forEach(uploadFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    console.log('🎯 [APP] 드래그 오버');
  };

  const uploadFile = async (file) => {
    console.log('📤 [APP] 파일 업로드 시작:', {
      name: file.name,
      size: file.size,
      type: file.type
    });
    
    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      console.warn('⚠️ [APP] 이미지가 아닌 파일 업로드 시도:', file.type);
      setMessage('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    console.log('✅ [APP] 이미지 파일 확인됨, 업로드 진행');
    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    const result = await uploadToS3(file, (progress) => {
      setUploadProgress(progress);
    });

    if (result.success) {
      console.log('🎉 [APP] 업로드 성공, 이미지 목록 새로고침');
      setMessage('업로드가 완료되었습니다!');
      // 이미지 목록 새로고침
      await loadImages();
    } else {
      console.error('💥 [APP] 업로드 실패:', result.error);
      setMessage(`업로드 실패: ${result.error}`);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const handleDelete = async (key) => {
    console.log('🗑️ [APP] 이미지 삭제 요청:', key);
    if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
      console.log('✅ [APP] 삭제 확인됨, 삭제 진행');
      const result = await deleteFromS3(key);
      if (result.success) {
        console.log('🎉 [APP] 삭제 성공, 이미지 목록 새로고침');
        setMessage('이미지가 삭제되었습니다.');
        await loadImages();
      } else {
        console.error('💥 [APP] 삭제 실패:', result.error);
        setMessage(`삭제 실패: ${result.error}`);
      }
    } else {
      console.log('❌ [APP] 삭제 취소됨');
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="App">
      <div className="upload-container">
        <h1>이미지 업로더</h1>
        <p>이미지를 드래그하거나 클릭하여 업로드하세요</p>
        
        <div
          className={`upload-area ${uploading ? 'uploading' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={openFileDialog}
        >
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="upload-input"
          />
          
          {uploading ? (
            <div>
              <div className="loading"></div>
              <p>업로드 중... {uploadProgress}%</p>
            </div>
          ) : (
            <div>
              <p className="upload-text">📁 파일을 여기에 드래그하거나 클릭하세요</p>
              <button className="upload-button">파일 선택</button>
            </div>
          )}
        </div>

        {message && (
          <div className={message.includes('실패') || message.includes('오류') ? 'error' : 'success'}>
            {message}
          </div>
        )}

        <div className="image-section">
          <h2>업로드된 이미지</h2>
          {loading ? (
            <div className="loading"></div>
          ) : images.length === 0 ? (
            <p>업로드된 이미지가 없습니다.</p>
          ) : (
            <div className="image-grid">
              {images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image.url} alt={image.key} />
                  <div className="image-info">
                    <p>{image.key}</p>
                    <p>{new Date(image.lastModified).toLocaleDateString('ko-KR')}</p>
                    <button 
                      onClick={() => handleDelete(image.key)}
                      className="delete-button"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
