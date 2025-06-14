import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { SummaryModel } from '@/models/Summary';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function GET(
  request: NextRequest,
  context: any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const summary = await SummaryModel.findById(db, context.params.id);
    
    if (!summary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(summary);
  } catch (error) {
    console.error('Error fetching summary:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summary' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function DELETE(
  request: NextRequest,
  context: any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  try {
    const client = await clientPromise;
    const db = client.db();
    const success = await SummaryModel.delete(db, context.params.id);
    
    if (!success) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting summary:', error);
    return NextResponse.json(
      { error: 'Failed to delete summary' },
      { status: 500 }
    );
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function PATCH(
  request: NextRequest,
  context: any // eslint-disable-line @typescript-eslint/no-explicit-any
) {
  try {
    const updates = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const updatedSummary = await SummaryModel.update(db, context.params.id, updates);
    
    if (!updatedSummary) {
      return NextResponse.json(
        { error: 'Summary not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedSummary);
  } catch (error) {
    console.error('Error updating summary:', error);
    return NextResponse.json(
      { error: 'Failed to update summary' },
      { status: 500 }
    );
  }
} 