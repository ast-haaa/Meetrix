import { NextResponse } from 'next/server';
import { calculateTeamAccountability } from '@/lib/accountabilityService';

export async function GET() {
  try {
    const accountabilityData = await calculateTeamAccountability();
    return NextResponse.json({
      success: true,
      teamMembers: accountabilityData,
    });
  } catch (error: any) {
    console.error('[API GET /api/accountability] Error:', error);
    return NextResponse.json({ error: 'Failed to calculate accountability stats', message: error.message }, { status: 500 });
  }
}
