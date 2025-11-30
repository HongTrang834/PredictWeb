export async function GET() {
  return Response.json({
    token: process.env.GOONG_ACCESS_TOKEN,
  })
}
