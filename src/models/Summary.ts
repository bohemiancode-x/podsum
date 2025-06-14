import { ObjectId, Db } from 'mongodb';
import { Podcast } from '@/types';

export interface SummaryDocument {
  _id?: ObjectId;
  podcastId: string;
  content: string;
  format: 'paragraph' | 'bullet-points' | 'key-takeaways' | 'executive-summary';
  characterCount: number;
  createdAt: Date;
  podcast: Podcast;
}

export interface SummaryInput {
  podcastId: string;
  content: string;
  format: 'paragraph' | 'bullet-points' | 'key-takeaways' | 'executive-summary';
  characterCount: number;
  podcast: Podcast;
}

export class SummaryModel {
  static async create(db: Db, summary: SummaryInput): Promise<SummaryDocument> {
    console.log('Creating summary:', summary.podcastId);
    const collection = db.collection<SummaryDocument>('summaries');
    const result = await collection.insertOne({
      ...summary,
      createdAt: new Date(),
    });
    console.log('Created summary with ID:', result.insertedId);
    return { ...summary, _id: result.insertedId, createdAt: new Date() };
  }

  static async findById(db: Db, id: string): Promise<SummaryDocument | null> {
    console.log('Finding summary:', id);
    const collection = db.collection<SummaryDocument>('summaries');
    const summary = await collection.findOne({ podcastId: id });
    console.log('Found summary:', summary ? 'yes' : 'no');
    return summary;
  }

  static async findAll(db: Db): Promise<SummaryDocument[]> {
    console.log('Finding all summaries');
    const collection = db.collection<SummaryDocument>('summaries');
    const summaries = await collection.find({}).sort({ createdAt: -1 }).toArray();
    console.log('Found summaries count:', summaries.length);
    return summaries;
  }

  static async delete(db: Db, id: string): Promise<boolean> {
    console.log('Deleting summary:', id);
    const collection = db.collection<SummaryDocument>('summaries');
    const result = await collection.deleteOne({ podcastId: id });
    console.log('Delete result:', result.deletedCount > 0);
    return result.deletedCount > 0;
  }

  static async update(db: Db, id: string, summary: Partial<SummaryInput>): Promise<SummaryDocument | null> {
    console.log('Updating summary:', id);
    const collection = db.collection<SummaryDocument>('summaries');
    const updatedDoc = await collection.findOneAndUpdate(
      { podcastId: id },
      { $set: summary },
      { returnDocument: 'after' }
    );
    console.log('Update result:', updatedDoc ? 'success' : 'not found');
    return updatedDoc;
  }
} 