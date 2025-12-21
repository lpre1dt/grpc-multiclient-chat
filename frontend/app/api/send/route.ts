import { NextRequest, NextResponse } from 'next/server';
import { getGrpcClient, promisifyGrpcCall } from '@/lib/grpc-client';

export async function POST(request: NextRequest) {
  try {
    const { user, message } = await request.json();

    if (!user || !message) {
      return NextResponse.json(
        { error: 'User and message are required' },
        { status: 400 }
      );
    }

    const client = getGrpcClient();
    const response = await promisifyGrpcCall(client.sendChat, { user, message });

    return NextResponse.json({
      message: response.message,
      success: true
    });
  } catch (error: any) {
    console.error('gRPC Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to send message' },
      { status: 500 }
    );
  }
}
