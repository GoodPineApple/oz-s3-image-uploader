import { S3Client, PutObjectCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';

// 환경 변수 디버깅
console.log('🔍 [AWS] 환경 변수 확인:', {
  VITE_AWS_ACCESS_KEY_ID: import.meta.env.VITE_AWS_ACCESS_KEY_ID ? '***설정됨***' : '❌ undefined',
  VITE_AWS_SECRET_ACCESS_KEY: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY ? '***설정됨***' : '❌ undefined',
  VITE_AWS_REGION: import.meta.env.VITE_AWS_REGION || '기본값 사용',
  VITE_S3_BUCKET_NAME: import.meta.env.VITE_S3_BUCKET_NAME || '❌ undefined'
});

// AWS S3 클라이언트 설정
const s3Client = new S3Client({
  region: import.meta.env.VITE_AWS_REGION || 'ap-northeast-2',
  credentials: {
    accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
    secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  },
});

const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;
console.log(`🪣 [AWS] 버킷 이름: ${BUCKET_NAME}`);

// 파일을 S3에 업로드하는 함수
export const uploadToS3 = async (file, onProgress) => {
  console.log('📤 [UPLOAD] 파일 업로드 시작:', {
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  });
  
  try {
    const fileName = `${Date.now()}-${file.name}`;
    console.log(`📝 [UPLOAD] 생성된 파일명: ${fileName}`);
    
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: file.type
    };
    
    console.log('⚙️ [UPLOAD] 업로드 파라미터:', {
      Bucket: uploadParams.Bucket,
      Key: uploadParams.Key,
      ContentType: uploadParams.ContentType,
      BodySize: uploadParams.Body.size
    });

    const upload = new Upload({
      client: s3Client,
      params: uploadParams,
    });
    
    console.log('🚀 [UPLOAD] S3 업로드 시작...');
    
    // 업로드 진행률 추적
    upload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      console.log(`📊 [UPLOAD] 진행률: ${percentage}% (${progress.loaded}/${progress.total} bytes)`);
      if (onProgress) {
        onProgress(percentage);
      }
    });

    const result = await upload.done();
    console.log('✅ [UPLOAD] 업로드 성공:', {
      Location: result.Location,
      Key: result.Key,
      ETag: result.ETag
    });
    
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      fileName: fileName
    };
  } catch (error) {
    console.error('❌ [UPLOAD] S3 업로드 오류:', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      fileName: file.name
    });
    return {
      success: false,
      error: error.message
    };
  }
};

// S3에서 파일 목록을 가져오는 함수
export const listS3Files = async () => {
  console.log('📋 [LIST] S3 파일 목록 조회 시작...');
  
  try {
    const params = {
      Bucket: BUCKET_NAME,
      MaxKeys: 100
    };
    
    console.log('⚙️ [LIST] 조회 파라미터:', params);

    const command = new ListObjectsV2Command(params);
    const result = await s3Client.send(command);
    
    console.log('📊 [LIST] S3 응답:', {
      KeyCount: result.KeyCount,
      IsTruncated: result.IsTruncated,
      ContentsCount: result.Contents ? result.Contents.length : 0
    });
    
    const files = result.Contents.map(item => ({
      key: item.Key,
      url: `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${item.Key}`,
      lastModified: item.LastModified,
      size: item.Size
    }));
    
    console.log('✅ [LIST] 파일 목록 조회 성공:', files.length, '개 파일');
    console.log('📁 [LIST] 파일 목록:', files.map(f => ({ key: f.key, size: f.size })));
    
    return {
      success: true,
      files: files
    };
  } catch (error) {
    console.error('❌ [LIST] S3 파일 목록 조회 오류:', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode
    });
    return {
      success: false,
      error: error.message
    };
  }
};

// S3에서 파일을 삭제하는 함수
export const deleteFromS3 = async (key) => {
  console.log('🗑️ [DELETE] 파일 삭제 시작:', { key });
  
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };
    
    console.log('⚙️ [DELETE] 삭제 파라미터:', params);

    const command = new DeleteObjectCommand(params);
    await s3Client.send(command);
    console.log('✅ [DELETE] 파일 삭제 성공:', key);
    
    return {
      success: true
    };
  } catch (error) {
    console.error('❌ [DELETE] S3 파일 삭제 오류:', {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      key: key
    });
    return {
      success: false,
      error: error.message
    };
  }
};
