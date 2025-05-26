import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req){
  const response = await axios.get(`${process.env.NEXT_PUBLIC_FASTAPI_URI}/job-analysis`);

  return NextResponse.json({
    response : response.data
  })
}