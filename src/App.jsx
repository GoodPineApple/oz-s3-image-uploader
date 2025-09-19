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
    loadImages();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const result = await listS3Files();
    if (result.success) {
      setImages(result.files);
    } else {
      setMessage(`이미지 로드 실패: ${result.error}`);
    }
    setLoading(false);
  };

  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    files.forEach(uploadFile);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    files.forEach(uploadFile);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const uploadFile = async (file) => {
    // 이미지 파일만 허용
    if (!file.type.startsWith('image/')) {
      setMessage('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setMessage('');

    const result = await uploadToS3(file, (progress) => {
      setUploadProgress(progress);
    });

    if (result.success) {
      setMessage('업로드가 완료되었습니다!');
      // 이미지 목록 새로고침
      await loadImages();
    } else {
      setMessage(`업로드 실패: ${result.error}`);
    }

    setUploading(false);
    setUploadProgress(0);
  };

  const handleDelete = async (key) => {
    if (window.confirm('이 이미지를 삭제하시겠습니까?')) {
      const result = await deleteFromS3(key);
      if (result.success) {
        setMessage('이미지가 삭제되었습니다.');
        await loadImages();
      } else {
        setMessage(`삭제 실패: ${result.error}`);
      }
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
