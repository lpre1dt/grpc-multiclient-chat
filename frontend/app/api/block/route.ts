import { NextRequest, NextResponse } from 'next/server';
import { getGrpcClient, promisifyGrpcCall } from '@/lib/grpc-client';

export async function POST(request: NextRequest) {
  try {
    const { username } = await request.json();

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const client = getGrpcClient();
    const response = await promisifyGrpcCall(client.blockUser, { username });

    return NextResponse.json({
      message: response.message,
      success: response.success,
    });
  } catch (error: any) {
    console.error('gRPC Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to block user' },
      { status: 500 }
    );
  }
}
