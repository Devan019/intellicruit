import axios from "axios";
import { NextResponse } from "next/server";

export async function GET(req,{params}){
  const {session} = params
  const api = await axios.get(`${process.env.NEXT_PUBLIC_FASTAPI_URI}/mock-interview/session/${session}`)

  return NextResponse.json({
    result : api.data
  })
}