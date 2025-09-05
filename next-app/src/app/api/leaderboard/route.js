import {NextResponse} from "next/server";
import sql from "../../../../db/db";

const dummyLeaderboard = [
  { sector_code: "12", total_points: 150, user_count: 25 },
  { sector_code: "15", total_points: 120, user_count: 18 }
];

async function getLeaderboard(){
    try {
        const result = await sql`SELECT sector,SUM(points) as
                                 total_points,COUNT(id) as user_count 
                                 FROM users 
                                 GROUP BY sector 
                                 ORDER BY total_points 
                                 DESC;`;

        return result;
    } catch (error) {
        console.error(error);
        return [];
    }

}
export async function GET() {
    return NextResponse.json({
        success : true,
        leaderboard : await getLeaderboard() || dummyLeaderboard
    });
}