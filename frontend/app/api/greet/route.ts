import { NextRequest, NextResponse } from 'next/server';
import { getGrpcClient, promisifyGrpcCall } from '@/lib/grpc-client';

export async function POST(request: NextRequest) {
  try {
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const client = getGrpcClient();
    const response = await promisifyGrpcCall(client.sayHello, { name });

    return NextResponse.json({
      message: response.message,
      success: true
    });
  } catch (error: any) {
    console.error('gRPC Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to connect to gRPC server' },
      { status: 500 }
    );
  }
}
