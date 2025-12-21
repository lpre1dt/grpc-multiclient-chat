import { NextResponse } from 'next/server';
import { getGrpcClient, promisifyGrpcCall } from '@/lib/grpc-client';

export async function GET() {
  try {
    const client = getGrpcClient();
    const response = await promisifyGrpcCall(client.getAllMessages, {});

    return NextResponse.json({
      messages: response.messages || [],
      success: true
    });
  } catch (error: any) {
    console.error('gRPC Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
