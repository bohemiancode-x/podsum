import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { SummaryModel } from '@/models/Summary';
import { Summary } from '@/types';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const summaries = await SummaryModel.findAll(db);
    return NextResponse.json(summaries);
  } catch (error) {
    console.error('Error fetching summaries:', error);
    return NextResponse.json(
      { error: 'Failed to fetch summaries' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const summary: Summary = await request.json();
    const client = await clientPromise;
    const db = client.db();
    const savedSummary = await SummaryModel.create(db, summary);
    return NextResponse.json(savedSummary);
  } catch (error) {
    console.error('Error creating summary:', error);
    return NextResponse.json(
      { error: 'Failed to create summary' },
      { status: 500 }
    );
  }
} 