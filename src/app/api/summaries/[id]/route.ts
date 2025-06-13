import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { SummaryModel } from '@/models/Summary';

export async function GET(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const client = await clientPromise;
    const db = client.db();
    const summary = await SummaryModel.findById(db, params.id);
    
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

export async function DELETE(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const client = await clientPromise;
    const db = client.db();
    const success = await SummaryModel.delete(db, params.id);
    
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

export async function PATCH(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const params = await context.params;
    const updates = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const updatedSummary = await SummaryModel.update(db, params.id, updates);
    
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