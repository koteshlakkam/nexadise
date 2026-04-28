"use client";

import { useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";

export default function TestSupabasePage() {
  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.from("users").select("*");
      console.log("Supabase users data:", data);
      console.log("Supabase users error:", error);
    })();
  }, []);

  return <div>Testing Supabase Connection...</div>;
}

