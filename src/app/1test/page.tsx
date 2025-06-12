'use client';
import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SupabaseTest() {
  useEffect(() => {
    const testConnection = async () => {
      const { data, error } = await supabase.from("programs").select("*");
      if (error) {
        console.error("❌ Supabase error:", error.message);
      } else {
        console.log("✅ Supabase data:", data);
      }
    };

    testConnection();
  }, []);

  return <div className="p-10 text-lg">Check the console for Supabase connection status.</div>;
}
