import { NextResponse } from "next/server";
import sql from "../../../../../../db/db";

// CORS headers for browser extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight OPTIONS request
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "User ID is required" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Get user data from database
    const userRecords = await sql`
      SELECT id, sector, points, last_active
      FROM users 
      WHERE id = ${id}
      ORDER BY last_active DESC
    `;

    if (userRecords.length === 0) {
      return NextResponse.json(
        { success: false, error: "User not found" }, 
        { status: 404, headers: corsHeaders }
      );
    }

    // Calculate total points across all records for this user
    const totalPoints = userRecords.reduce((sum, record) => sum + parseInt(record.points), 0);
    
    // Get the most recent record for last_active
    const latestRecord = userRecords[0];
    
    // Calculate streak (simplified calculation based on last_active)
    const lastActiveDate = new Date(latestRecord.last_active);
    const today = new Date();
    const daysDiff = Math.floor((today - lastActiveDate) / (1000 * 60 * 60 * 24));
    const streak = daysDiff <= 1 ? Math.max(1, Math.floor(totalPoints / 10)) : 0; // Rough estimate

    // Calculate action counts based on the scoring system:
    // +1 per "no cutlery", +2 per "green delivery", +1 per "paperless", +3 per "eco-friendly product"
    
    // Estimate action distribution (these percentages can be adjusted based on real data patterns)
    const estimatedNoCutleryActions = Math.floor(totalPoints * 0.4); // 40% of points from no cutlery (+1 each)
    const estimatedGreenDeliveryActions = Math.floor(totalPoints * 0.3 / 2); // 30% of points from green delivery (+2 each)
    const estimatedPaperlessActions = Math.floor(totalPoints * 0.2); // 20% of points from paperless (+1 each)
    const estimatedEcoProductActions = Math.floor(totalPoints * 0.1 / 3); // 10% of points from eco products (+3 each)

    // Action counts
    const noCutleryCount = estimatedNoCutleryActions;
    const greenDeliveryCount = estimatedGreenDeliveryActions;
    const paperlessCount = estimatedPaperlessActions;
    const ecoProductCount = estimatedEcoProductActions;
    
    // Total items saved (sum of all eco-friendly actions)
    const itemsSaved = noCutleryCount + greenDeliveryCount + paperlessCount + ecoProductCount;

    // Calculate environmental impact estimates
    const co2Saved = Math.round((noCutleryCount * 0.1) + (greenDeliveryCount * 0.8) + (paperlessCount * 0.2) + (ecoProductCount * 1.5)); // kg CO2 per action type
    const waterSaved = Math.round((noCutleryCount * 0.5) + (greenDeliveryCount * 2.0) + (paperlessCount * 1.0) + (ecoProductCount * 5.0)); // Liters per action type
    const wasteReduced = Math.round((noCutleryCount * 0.05) + (greenDeliveryCount * 0.3) + (paperlessCount * 0.1) + (ecoProductCount * 0.8)); // kg waste per action type

    const stats = {
      userId: id,
      sector: latestRecord.sector,
      streak: streak,
      greenPoints: totalPoints,
      itemsSaved: itemsSaved,
      
      // Action counts based on scoring system
      noCutleryCount: noCutleryCount,        // +1 point each
      greenDeliveryCount: greenDeliveryCount, // +2 points each  
      paperlessCount: paperlessCount,         // +1 point each
      ecoProductCount: ecoProductCount,       // +3 points each
      
      // Environmental impact
      co2Saved: co2Saved,
      waterSaved: waterSaved,
      wasteReduced: wasteReduced,
      
      // Additional metrics
      lastActive: latestRecord.last_active,
      recordCount: userRecords.length,
      averagePointsPerAction: userRecords.length > 0 ? Math.round(totalPoints / userRecords.length) : 0,
      
      // Scoring breakdown for transparency
      scoringBreakdown: {
        noCutlery: `${noCutleryCount} actions × 1 point = ${noCutleryCount} points`,
        greenDelivery: `${greenDeliveryCount} actions × 2 points = ${greenDeliveryCount * 2} points`,
        paperless: `${paperlessCount} actions × 1 point = ${paperlessCount} points`,
        ecoProducts: `${ecoProductCount} actions × 3 points = ${ecoProductCount * 3} points`
      }
    };

    return NextResponse.json({ 
      success: true, 
      stats: stats
    }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { success: false, error: error.message }, 
      { status: 500, headers: corsHeaders }
    );
  }
}
