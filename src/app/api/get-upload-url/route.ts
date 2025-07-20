import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { generateFileName } from '@/utils/s3Client';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'iidx-bpi-manager-avatars';

export async function POST(request: NextRequest) {
  try {
    const { fileName, contentType, userId } = await request.json();

    if (!fileName || !contentType || !userId) {
      return NextResponse.json(
        { error: '必要なパラメータが不足しています' },
        { status: 400 }
      );
    }

    // ファイル名を生成
    const generatedFileName = generateFileName(fileName, userId);
    const key = `avatars/${generatedFileName}`;

    // 署名付きURLを生成（ACLとチェックサムを削除）
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
      // ACL: 'public-read', // 削除: ACLが無効化されている可能性
    });

    const signedUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 300, // 5分間有効
      // チェックサムアルゴリズムを無効化
      unhoistableHeaders: new Set(),
    });

    return NextResponse.json({
      success: true,
      uploadUrl: signedUrl,
      fileName: generatedFileName,
      avatarUrl: `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'ap-northeast-1'}.amazonaws.com/${key}`
    });

  } catch (error) {
    console.error('署名付きURL生成エラー:', error);
    return NextResponse.json(
      { error: '署名付きURLの生成に失敗しました' },
      { status: 500 }
    );
  }
} 