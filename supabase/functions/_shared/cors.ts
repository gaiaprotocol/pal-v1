import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
};

export const response = (data: string | object) => {
  if (typeof data === "string") {
    return new Response(data, { headers: corsHeaders });
  }
  return new Response(JSON.stringify(data), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

const responseError = (errorMessage: string) => {
  return new Response(errorMessage, {
    status: 500,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

export const serveWithOptions = (
  handler: (req: Request) => Promise<Response | void>,
) => {
  serve(async (req) => {
    if (req.method === "OPTIONS") {
      return response("ok");
    }
    try {
      const result = await handler(req);
      if (result) return result;
      return response({});
    } catch (error) {
      return responseError(error.message);
    }
  });
};
