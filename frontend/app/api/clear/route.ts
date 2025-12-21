import { NextRequest, NextResponse } from 'next/server';
import { getGrpcClient, promisifyGrpcCall } from '@/lib/grpc-client';

export async function POST(request: NextRequest) {
  try {
    const { user } = await request.json();

    if (!user) {
      return NextResponse.json(
        { error: 'User is required' },
        { status: 400 }
      );
    }

    const client = getGrpcClient();
    const response = await promisifyGrpcCall(client.clearMyMessages, { user });

    return NextResponse.json({
      message: response.message,
      deleted_count: response.deleted_count,
      success: true
    });
  } catch (error: any) {
    console.error('gRPC Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to clear messages' },
      { status: 500 }
    );
  }
}
