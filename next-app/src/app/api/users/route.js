import { NextResponse } from "next/server";
import sql from "../../../../db/db";

// CORS headers for browser extension
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle preflight OPTIONS request
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 200,
    headers: corsHeaders,
  });
}

export async function POST(request) {
  try {
    // Check if request has a body
    const text = await request.text();
    console.log("Raw request body:", text);
    
    if (!text) {
      return NextResponse.json(
        { success: false, error: "No request body" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Parse JSON manually with better error handling
    let data;
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("JSON parse error:", parseError);
      return NextResponse.json(
        { success: false, error: "Invalid JSON format" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    const { userId, sectorCode, points } = data;

    // Validate required fields
    if (!userId || !sectorCode || points === undefined) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" }, 
        { status: 400, headers: corsHeaders }
      );
    }

    // Database operation
    await sql`
      INSERT INTO users (id, sector, points, last_active)
      VALUES (${userId}, ${sectorCode}, ${points}, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        points = users.points + ${points},
        last_active = NOW()
    `;

    return NextResponse.json({ 
      success: true, 
      message: `Awarded ${points} points to user in sector ${sectorCode}` 
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