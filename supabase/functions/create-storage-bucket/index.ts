
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1";

// Set up Supabase client with service role key
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (_req) => {
  try {
    // Create invoices bucket if it doesn't exist
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets();

    if (listError) throw listError;

    const invoicesBucketExists = buckets.some(bucket => bucket.name === "invoices");
    
    if (!invoicesBucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket("invoices", {
          public: true,
          fileSizeLimit: 1024 * 1024, // 1MB
        });
      
      if (createError) throw createError;
      console.log("Created 'invoices' bucket");
    } else {
      console.log("'invoices' bucket already exists");
    }

    // Create profiles bucket if it doesn't exist
    const profilesBucketExists = buckets.some(bucket => bucket.name === "profiles");
    
    if (!profilesBucketExists) {
      const { error: createError } = await supabase
        .storage
        .createBucket("profiles", {
          public: true,
          fileSizeLimit: 2 * 1024 * 1024, // 2MB
        });
      
      if (createError) throw createError;
      console.log("Created 'profiles' bucket");
    } else {
      console.log("'profiles' bucket already exists");
    }

    return new Response(
      JSON.stringify({ 
        message: "Storage buckets checked/created successfully" 
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
