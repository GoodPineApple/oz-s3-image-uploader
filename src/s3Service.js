import AWS from 'aws-sdk';

// AWS 설정
const s3 = new AWS.S3({
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.VITE_AWS_REGION || 'ap-northeast-2'
});

const BUCKET_NAME = import.meta.env.VITE_S3_BUCKET_NAME;

// 파일을 S3에 업로드하는 함수
export const uploadToS3 = async (file, onProgress) => {
  try {
    const fileName = `${Date.now()}-${file.name}`;
    const uploadParams = {
      Bucket: BUCKET_NAME,
      Key: fileName,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read' // 웹에서 접근 가능하도록 설정
    };

    const upload = s3.upload(uploadParams);
    
    // 업로드 진행률 추적
    upload.on('httpUploadProgress', (progress) => {
      const percentage = Math.round((progress.loaded / progress.total) * 100);
      if (onProgress) {
        onProgress(percentage);
      }
    });

    const result = await upload.promise();
    
    return {
      success: true,
      url: result.Location,
      key: result.Key,
      fileName: fileName
    };
  } catch (error) {
    console.error('S3 업로드 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// S3에서 파일 목록을 가져오는 함수
export const listS3Files = async () => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      MaxKeys: 100
    };

    const result = await s3.listObjectsV2(params).promise();
    
    return {
      success: true,
      files: result.Contents.map(item => ({
        key: item.Key,
        url: `https://${BUCKET_NAME}.s3.${import.meta.env.VITE_AWS_REGION || 'ap-northeast-2'}.amazonaws.com/${item.Key}`,
        lastModified: item.LastModified,
        size: item.Size
      }))
    };
  } catch (error) {
    console.error('S3 파일 목록 조회 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// S3에서 파일을 삭제하는 함수
export const deleteFromS3 = async (key) => {
  try {
    const params = {
      Bucket: BUCKET_NAME,
      Key: key
    };

    await s3.deleteObject(params).promise();
    
    return {
      success: true
    };
  } catch (error) {
    console.error('S3 파일 삭제 오류:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
